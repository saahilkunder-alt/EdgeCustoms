export interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json() as any;
    const {
      customerName,
      customerPhone,
      vehicleCategory,
      vehicleType,
      carBrand,
      carModel,
      customBrand,
      customModel,
      registrationNumber,
      carColor,
      odometerReading,
      fuelLevel,
      selectedServices,
      remarks,
      customerAcknowledged,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      finalAmount,
      beforePhotos,
      job_id
    } = data;

    const db = context.env.DB;

    // 1. Get or Create Customer
    let customer = await db.prepare('SELECT id FROM customers WHERE phone = ?').bind(customerPhone).first() as any;
    const customerId = customer ? customer.id : crypto.randomUUID();

    const customerUpsert = db.prepare(`
      INSERT INTO customers (id, name, phone, last_visit) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(phone) DO UPDATE SET 
        name = excluded.name, 
        last_visit = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `).bind(customerId, customerName, customerPhone);

    // 2. Get or Create Vehicle
    const vehicleId = crypto.randomUUID();
    const registrationNumberUpper = registrationNumber ? registrationNumber.toUpperCase() : '';
    const vehicleUpsert = db.prepare(`
      INSERT INTO customer_vehicles (id, customer_id, brand, model, custom_brand, custom_model, registration_number, color, odometer_reading, fuel_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(registration_number) DO UPDATE SET
        brand = excluded.brand,
        model = excluded.model,
        custom_brand = excluded.custom_brand,
        custom_model = excluded.custom_model,
        color = excluded.color,
        odometer_reading = excluded.odometer_reading,
        fuel_level = excluded.fuel_level
    `).bind(vehicleId, customerId, carBrand, carModel, customBrand, customModel, registrationNumberUpper, carColor, odometerReading, fuelLevel);

    // 3. Create Job
    const jobId = crypto.randomUUID();
    const jobInsert = db.prepare(`
      INSERT INTO jobs (
        id, job_id, status, customer_id, customer_name, customer_phone,
        vehicle_category, vehicle_type, car_brand, car_model, custom_brand, custom_model, registration_number, car_color,
        odometer_reading, fuel_level, subtotal, discount_type, discount_value,
        discount_amount, final_amount, remarks, customer_acknowledged
      ) VALUES (?, ?, 'Received', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      jobId, job_id, customerId, customerName, customerPhone,
      vehicleCategory, vehicleType, carBrand, carModel, customBrand, customModel, registrationNumber.toUpperCase(), carColor,
      odometerReading, fuelLevel, subtotal, discountType, discountValue,
      discountAmount, finalAmount, remarks, customerAcknowledged ? 1 : 0
    );

    // 4. Create Job Services
    const serviceInserts = selectedServices.map((svc: any) => {
      return db.prepare(`
        INSERT INTO job_services (id, job_id, service_id, name, category, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), jobId, svc.id, svc.name, svc.category, svc.price);
    });

    // 5. Create Job Photos (Before Photos)
    const photoInserts = (beforePhotos || []).map((photo: string) => {
      return db.prepare(`
        INSERT INTO job_photos (id, job_id, photo_type, photo_url)
        VALUES (?, ?, 'before', ?)
      `).bind(crypto.randomUUID(), jobId, photo);
    });

    // Execute main metadata in batch
    await db.batch([
      customerUpsert,
      vehicleUpsert,
      jobInsert,
      ...serviceInserts
    ]);

    // Execute photo inserts sequentially to avoid 1MB batch limit
    for (const photoStmt of photoInserts) {
      await photoStmt.run();
    }

    return Response.json({ success: true, id: job_id });

  } catch (err: any) {
    return Response.json({ success: false, message: 'Failed to create job.', error: err.message }, { status: 500 });
  }
};
