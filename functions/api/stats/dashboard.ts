export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Get Today's Stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status IN ('Completed', 'Delivered') THEN 1 ELSE 0 END) as completed,
        SUM(final_amount) as revenue
      FROM jobs 
      WHERE created_at LIKE ? AND is_deleted = 0
    `;
    const stats = await context.env.DB.prepare(statsQuery).bind(`${today}%`).first() as any;

    // 2. Get Recent Jobs (Top 5)
    const recentJobsQuery = `
      SELECT 
        id as internal_id, 
        job_id as id, 
        customer_name as customerName,
        car_brand as carBrand,
        car_model as carModel,
        registration_number as registrationNumber,
        status,
        final_amount as finalAmount,
        created_at as createdAt
      FROM jobs 
      WHERE is_deleted = 0 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    const { results: recentJobs } = await context.env.DB.prepare(recentJobsQuery).all();

    // 3. Get Total Customer Count
    const customerCountQuery = `SELECT COUNT(*) as count FROM customers`;
    const customerCount = await context.env.DB.prepare(customerCountQuery).first() as any;

    return Response.json({
      success: true,
      data: {
        stats: {
          total: stats.total || 0,
          inProgress: stats.inProgress || 0,
          completed: stats.completed || 0,
          revenue: stats.revenue || 0
        },
        recentJobs,
        totalCustomers: customerCount.count || 0
      }
    });

  } catch (err: any) {
    return Response.json({ 
      success: false, 
      message: 'Failed to fetch dashboard data.', 
      error: err.message 
    }, { status: 500 });
  }
};
