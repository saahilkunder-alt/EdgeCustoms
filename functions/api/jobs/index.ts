export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { searchParams } = new URL(context.request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    let query = `
      SELECT 
        job_id as id, 
        customer_name as customerName,
        customer_phone as customerPhone,
        car_brand as carBrand,
        car_model as carModel,
        registration_number as registrationNumber,
        status,
        final_amount as finalAmount,
        created_at as createdAt
      FROM jobs 
      WHERE is_deleted = 0
    `;

    const params: any[] = [];
    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (job_id LIKE ? OR customer_name LIKE ? OR registration_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const { results } = await context.env.DB.prepare(query).bind(...params).all();

    return Response.json({ success: true, data: results });

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
