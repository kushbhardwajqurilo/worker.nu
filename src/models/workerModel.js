const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    // ---- activation date ----
    activation_date: { type: Date },

    // ---- worker personal details ----
    worker_personal_details: {
      firstName: {
        type: String,
        required: [true, "worker first name required"],
      },
      lastName: { type: String, default: "" },
      phone_country: { type: String },
      phone: {
        type: String,
        required: [true, "worker phone number required"],
        unique: [true, "phone number already in use"],
      },
    },

    // ---- worker position ----
    worker_position: {
      type: String,
    },

    // ---- worker project ----
    project: {
      type: [
        {
          projectId: { type: String },
        },
      ],
      default: [],
    },

    // ---- language ----
    language: {
      type: String,
      enum: {
        values: ["English", "Russian", "Lithuanian"],
        message: "Language must be either English, Russian or Lithuanian",
      },
    },

    // ---- worker hours access settings ----
    worker_hours_access_settings: {
      see_hours: { type: Boolean, default: false },
      edit_hours: { type: Boolean, default: false },
      add_new_worker: { type: Boolean, default: false },
      add_new_project: { type: Boolean, default: false },
      add_project_expense: { type: Boolean, default: false },
      edit_company_project: { type: Boolean, default: false },
    },

    // ---- worker tool access settings ----
    worker_tools_access_settings: {
      change_tool_status: { type: Boolean, default: false },
      see_company_tools: { type: Boolean, default: false },
      scan_storage: { type: Boolean, default: false },
      storage_inventorization: { type: Boolean, default: false },
      add_new_tools: { type: Boolean, default: false },
      edit_tools: { type: Boolean, default: false },
      change_qr_code: { type: Boolean, default: false },
    },

    other_access_settings: {
      make_worker_team_leader: { type: Boolean, default: false },
    },

    worker_holiday: {
      remaining_holidays: { type: Number, default: 0 },
      holidays_per_month: { type: Number, default: 0 },
      holidays_taken: { type: Number, default: 0 },
      sickness_per_month: { type: Number, default: 0 },
      remaining_sickness: { type: Number, default: 0 },
      sickness_taken: { type: Number, default: 0 },
    },

    worker_economical_data: {
      worker_hourly_cost: { type: Number },
      worker_hourly_salary: { type: Number },
    },

    // ---- worker personal information ----
    personal_information: {
      upload_documents_enabled: { type: Boolean, default: false },

      documents: {
        profile_picture: { type: String, default: null },
        drivers_license: { type: String, default: null },
        passport: { type: String, default: null },
        national_id_card: { type: String, default: null },
        worker_work_id: { type: String, default: null },
        other_files: {
          type: [
            {
              fileName: { type: String },
              file: { type: String },
            },
          ],
          default: [],
        },
      },

      personal_info: { type: Boolean, default: false },
      email: { type: String },

      date_of_birth: { type: Date },

      bank_details: {
        bank_name: { type: String },
        swift: { type: String },
        international_bank_account_number: { type: String },
        local_bank_account_number: { type: String },
        tax_identification_number: { type: String },
      },

      address_details: {
        street: { type: String },
        house_apartment_number: { type: String },
        city: { type: String },
        country: { type: String },
        post: { type: String },
      },

      close_contact: {
        name: { type: String },
        surname: { type: String },
        email: { type: String },
        phone_country: { type: String },
        phone_number: { type: String },
        notes: { type: String },
      },

      clothing_sizes_enabled: { type: Boolean, default: false },

      clothing_sizes: {
        suit_combo_size: { type: String },
        tshirt_jacket_size: { type: String },
        pants_size: { type: String },
        shoes_size: { type: String },
      },

      additional_information: { type: String },
    },

    // ---- global flags ----
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    dashboardUrl: { type: String, default: null },
    urlVisibleToAdmin: { type: Boolean, default: true },

    urlAdminExpireAt: {
      type: Date,
      default: () => Date.now() + 10 * 60 * 1000, // expires in 10 mins
    },
  },
  {
    timestamps: false,
  }
);

// ==== WORKER POSITION SCHEMA FIXED ====
const workerPositionSchema = new mongoose.Schema({
  position: {
    type: String,
    unique: [true, "position already exists"],
    required: [true, "position required"],
  },
});

const workerPositionModel = mongoose.model(
  "worker_position",
  workerPositionSchema
);

const workerModel = mongoose.model("worker", workerSchema);
module.exports = { workerModel, workerPositionModel };
