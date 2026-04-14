export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const phone = url.searchParams.get('phone');

    if (!phone || phone.length !== 10) {
      return Response.json({ success: false, message: 'Invalid phone number.' }, { status: 400 });
    }

    // 1. Find Customer
    const customer = await context.env.DB.prepare(
      'SELECT id, name, phone, total_revenue, last_visit FROM customers WHERE phone = ? LIMIT 1'
    ).bind(phone).first() as any;

    if (!customer) {
      return Response.json({ success: true, exists: false });
    }

    // 2. Find Latest Vehicle
    const vehicle = await context.env.DB.prepare(
      'SELECT brand, model, custom_brand, custom_model, registration_number, color, odometer_reading, fuel_level FROM customer_vehicles WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(customer.id).first() as any;

    return Response.json({
      success: true,
      exists: true,
      customer: {
        ...customer,
        lastVehicle: vehicle || null
      }
    });

  } catch (err: any) {
    return Response.json({ success: false, message: 'Customer lookup failed.', error: err.message }, { status: 500 });
  }
};
