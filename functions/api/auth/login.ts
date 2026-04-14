export interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const request = context.request;
    const body = await request.json() as { role: string; pin: string };
    const { role, pin } = body;

    if (!role || !pin) {
      return Response.json({ success: false, message: 'Missing role or password.' }, { status: 400 });
    }

    // Hash the input pin using SHA-1 to match the legacy format stored in the database
    const msgUint8 = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Query the database for a matching active user
    const query = `SELECT id, username, role FROM users WHERE role = ? AND password = ? AND is_active = 1 LIMIT 1;`;
    const result = await context.env.DB.prepare(query).bind(role, hashedPin).first();

    if (result) {
      return Response.json({ success: true, user: result });
    } else {
      // 401 Unauthorized
      return Response.json({ success: false, message: 'Invalid password. Please try again.' }, { status: 401 });
    }
  } catch (err: any) {
    return Response.json({ success: false, message: 'Secure authentication failed. Please try again.', error: err.message }, { status: 500 });
  }
};
