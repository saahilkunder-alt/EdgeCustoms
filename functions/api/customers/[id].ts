export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;

    // 1. Get Customer profile with calculated stats
    const customer = await context.env.DB.prepare(`
      SELECT 
        c.id, c.name, c.phone, 
        c.created_at as createdAt,
        COALESCE(SUM(j.final_amount), 0) as totalRevenue,
        MAX(j.created_at) as lastVisit
      FROM customers c
      INNER JOIN jobs j ON c.id = j.customer_id AND j.is_deleted = 0
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first() as any;

    if (!customer) {
      return Response.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    // 2. Get Vehicles
    const { results: vehicles } = await context.env.DB.prepare(`
      SELECT brand, model, custom_brand as customBrand, custom_model as customModel, registration_number as registrationNumber, color
      FROM customer_vehicles
      WHERE customer_id = ?
    `).bind(id).all();

    // 3. Get Job History
    const { results: jobs } = await context.env.DB.prepare(`
      SELECT 
        job_id as id, 
        status, 
        car_brand as carBrand, 
        car_model as carModel, 
        custom_brand as customBrand,
        custom_model as customModel,
        registration_number as registrationNumber,
        final_amount as finalAmount, 
        created_at as createdAt
      FROM jobs 
      WHERE customer_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
    `).bind(id).all();

    return Response.json({
      success: true,
      data: {
        ...customer,
        vehicles,
        jobs
      }
    });

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
