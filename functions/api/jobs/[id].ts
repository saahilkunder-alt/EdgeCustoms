export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;

    // 1. Get Job Core data
    const jobQuery = `
      SELECT 
        id as internal_id,
        job_id as id,
        status,
        customer_id as customerId,
        customer_name as customerName,
        customer_phone as customerPhone,
        vehicle_category as vehicleCategory,
        vehicle_type as vehicleType,
        car_brand as carBrand,
        car_model as carModel,
        registration_number as registrationNumber,
        car_color as carColor,
        odometer_reading as odometerReading,
        fuel_level as fuelLevel,
        subtotal,
        discount_type as discountType,
        discount_value as discountValue,
        discount_amount as discountAmount,
        final_amount as finalAmount,
        payment_mode as payment_mode,
        payment_amount as payment_amount,
        payment_transaction_id as payment_transaction_id,
        payment_paid_at as payment_paid_at,
        remarks,
        customer_acknowledged as customerAcknowledged,
        created_at as createdAt,
        updated_at as updatedAt
      FROM jobs 
      WHERE job_id = ? AND is_deleted = 0
    `;
    const job = await context.env.DB.prepare(jobQuery).bind(id).first() as any;

    if (!job) {
      return Response.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    // 2. Get Services
    const servicesQuery = `
      SELECT id, service_id as serviceId, name, category, price
      FROM job_services 
      WHERE job_id = ?
    `;
    const { results: services } = await context.env.DB.prepare(servicesQuery).bind(job.internal_id).all();

    // 3. Get Photos
    const photosQuery = `
      SELECT photo_url, photo_type
      FROM job_photos 
      WHERE job_id = ?
    `;
    const { results: photos } = await context.env.DB.prepare(photosQuery).bind(job.internal_id).all() as any;

    const beforePhotos = (photos || [])
      .filter((p: any) => p.photo_type === 'before')
      .map((p: any) => p.photo_url);

    const afterPhotos = (photos || [])
      .filter((p: any) => p.photo_type === 'after')
      .map((p: any) => p.photo_url);

    // 4. Format Payment Info for JobCard model
    const payment = job.payment_mode ? {
      mode: job.payment_mode,
      amount: job.payment_amount,
      transactionId: job.payment_transaction_id,
      paidAt: job.payment_paid_at
    } : null;

    // 4. Assemble the JobCard
    const formattedJob = {
      ...job,
      selectedServices: services,
      payment,
      beforePhotos,
      afterPhotos,
      editHistory: []   // TODO: Fetch from job_edit_log
    };

    return Response.json({ success: true, data: formattedJob });

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;

    // Soft delete the job by setting is_deleted = 1
    const updateQuery = `
      UPDATE jobs 
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = ?
    `;
    const result = await context.env.DB.prepare(updateQuery).bind(id).run();

    if (result.success) {
      return Response.json({ success: true, message: 'Job deleted successfully' });
    } else {
      throw new Error('Failed to update database');
    }
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
