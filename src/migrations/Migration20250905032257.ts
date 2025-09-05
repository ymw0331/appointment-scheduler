import { Migration } from '@mikro-orm/migrations';

export class Migration20250905032257 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "day_off" ("id" uuid not null, "date" date not null, "note" text null, "created_at" timestamptz not null, constraint "day_off_pkey" primary key ("id"));`);
    this.addSql(`alter table "day_off" add constraint "day_off_date_unique" unique ("date");`);

    this.addSql(`create table "unavailable_window" ("id" uuid not null, "weekday" int null, "date" date null, "start_time" time(0) not null, "end_time" time(0) not null, "note" text null, "created_at" timestamptz not null, constraint "unavailable_window_pkey" primary key ("id"), constraint unavailable_window_check check (start_time < end_time));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "day_off" cascade;`);

    this.addSql(`drop table if exists "unavailable_window" cascade;`);
  }

}
