const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

export async function createCheckoutUrl(userId: string, userEmail: string, variantId?: string, locale = 'tr'): Promise<string> {
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
  variantId = variantId ?? process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID;

  const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });

  const data = await response.json();
  return data.data?.attributes?.url || '';
}
