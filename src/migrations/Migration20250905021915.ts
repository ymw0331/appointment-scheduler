import { Migration } from '@mikro-orm/migrations';

export class Migration20250905021915 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "app_config" ("id" uuid not null, "slot_duration_minutes" int not null default 30, "max_slots_per_appointment" int not null default 1, "operational_days" text[] not null default '{1,2,3,4,5}', "operational_start_time" time(0) not null default '09:00', "operational_end_time" time(0) not null default '18:00', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "app_config_pkey" primary key ("id"));`);

    this.addSql(`create table "appointment" ("id" uuid not null, "date" date not null, "start_time" time(0) not null, "slot_count" int not null, "customer_name" varchar(255) null, "customer_email" varchar(255) null, constraint "appointment_pkey" primary key ("id"));`);
    this.addSql(`create index "appointment_date_start_time_index" on "appointment" ("date", "start_time");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "app_config" cascade;`);

    this.addSql(`drop table if exists "appointment" cascade;`);
  }

}
