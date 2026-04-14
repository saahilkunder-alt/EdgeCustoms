export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { searchParams } = new URL(context.request.url);
    const query = searchParams.get('q');

    let sql = `
      SELECT 
        c.id, 
        c.name, 
        c.phone, 
        COALESCE(SUM(j.final_amount), 0) as totalRevenue,
        MAX(j.created_at) as lastVisit,
        c.created_at as createdAt,
        (SELECT COUNT(*) FROM jobs WHERE customer_id = c.id AND is_deleted = 0) as jobCount
      FROM customers c
      LEFT JOIN jobs j ON c.id = j.customer_id AND j.is_deleted = 0
    `;

    const params: any[] = [];
    if (query) {
      sql += ` WHERE c.name LIKE ? OR c.phone LIKE ?`;
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT 50`;

    const { results } = await context.env.DB.prepare(sql).bind(...params).all();

    return Response.json({ success: true, data: results });

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
