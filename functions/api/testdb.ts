export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "DB" with the variable name you defined.
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    // Basic test query to get the internal sqlite version
    // This confirms that we can successfully communicate with the D1 database
    const { results } = await context.env.DB.prepare('SELECT 1 AS val').all();

    return Response.json({
      success: true,
      message: "Successfully connected to D1!",
      data: results
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      message: "Database connection failed.",
      error: error.message
    }, { status: 500 });
  }
}
