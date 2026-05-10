import { iikoRequest } from './client';

interface IikoOrderItem {
  productId: string;
  amount: number;
  price: number;
}

interface IikoPayment {
  paymentTypeId: string;
  sum: number;
  isPreliminary: boolean;
}

interface IikoCreateDeliveryPayload {
  organizationId: string;
  terminalGroupId: string;
  order: {
    phone: string;
    completeBefore?: string;
    deliveryPoint?: {
      address: {
        street: { name: string };
        house: string;
        apartment?: string;
        entrance?: string;
        floor?: string;
        intercom?: string;
      };
    };
    comment?: string;
    customer: {
      name: string;
      phone: string;
    };
    items: IikoOrderItem[];
    payments: IikoPayment[];
  };
}

function parseAddress(address: string): {
  street: { name: string };
  house: string;
} {
  const parts = address.split(',').map((s) => s.trim());

  if (parts.length >= 2) {
    return {
      street: { name: parts[0] },
      house: parts[1].replace(/[^\d]/g, '') || '1',
    };
  }

  return {
    street: { name: address },
    house: '1',
  };
}

interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  iikoProductId?: string | null;
}

interface PushOrderParams {
  phone: string;
  name: string;
  deliveryType: 'DELIVERY' | 'PICKUP';
  address?: string | null;
  comment?: string | null;
  items: OrderItemData[];
  paymentTypeId: string;
  totalAmount: number;
  organizationId: string;
  terminalGroupId: string;
}

export async function pushOrderToIiko(
  params: PushOrderParams
): Promise<string> {
  const {
    phone,
    name,
    deliveryType,
    address,
    comment,
    items,
    paymentTypeId,
    totalAmount,
    organizationId,
    terminalGroupId,
  } = params;

  const payload: IikoCreateDeliveryPayload = {
    organizationId,
    terminalGroupId,
    order: {
      phone,
      comment: comment || undefined,
      customer: {
        name: name || 'Гость',
        phone,
      },
      ...(deliveryType === 'DELIVERY' && address
        ? {
            deliveryPoint: {
              address: parseAddress(address),
            },
          }
        : {}),
      items: items
        .filter((item) => item.iikoProductId)
        .map((item) => ({
          productId: item.iikoProductId!,
          amount: item.quantity,
          price: item.price / 100,
        })),
      payments: [
        {
          paymentTypeId,
          sum: totalAmount / 100,
          isPreliminary: true,
        },
      ],
    },
  };

  const result = await iikoRequest<{ orderInfo: { id: string } }>(
    '/deliveries/create',
    payload
  );

  return result.orderInfo.id;
}

export async function getIikoOrderStatus(
  organizationId: string,
  iikoOrderId: string
): Promise<string> {
  const result = await iikoRequest<{
    orders: Array<{ deliveryStatus: string }>;
  }>('/deliveries/by_id', {
    organizationId,
    orderIds: [iikoOrderId],
  });

  return result.orders[0]?.deliveryStatus ?? 'Unknown';
}

export const iikoStatusToOrderStatus: Record<string, string> = {
  Unconfirmed: 'PENDING',
  WaitCooking: 'CONFIRMED',
  ReadyForCooking: 'CONFIRMED',
  CookingStarted: 'PREPARING',
  CookingCompleted: 'READY',
  Waiting: 'READY',
  OnWay: 'DELIVERING',
  Delivered: 'COMPLETED',
  Closed: 'COMPLETED',
  Cancelled: 'CANCELLED',
};