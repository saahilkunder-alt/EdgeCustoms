export interface Env {
  DB: D1Database;
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const { id, status, payment, editor_role } = body; // id is job_id (EC-...)

    // 1. Get internal ID
    const job = await context.env.DB.prepare('SELECT id, status FROM jobs WHERE job_id = ?').bind(id).first() as any;
    if (!job) return Response.json({ success: false, message: 'Job not found' }, { status: 404 });

    const statements: D1PreparedStatement[] = [];

    // 2. Status Update
    if (status) {
      statements.push(
        context.env.DB.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, job.id)
      );
      // Log status change
      statements.push(
        context.env.DB.prepare(`
          INSERT INTO job_edit_log (id, job_id, editor_role, field, old_value, new_value)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(crypto.randomUUID(), job.id, editor_role || 'staff', 'status', job.status, status)
      );
    }

    // 3. Payment Update
    if (payment) {
      statements.push(
        context.env.DB.prepare(`
          UPDATE jobs SET 
            payment_mode = ?, 
            payment_amount = ?, 
            payment_transaction_id = ?, 
            payment_paid_at = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          payment.mode, 
          payment.amount, 
          payment.transactionId ?? null, 
          payment.paidAt ?? null, 
          job.id
        )
      );
    }

    if (statements.length > 0) {
      await context.env.DB.batch(statements);
    }

    return Response.json({ success: true });

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
