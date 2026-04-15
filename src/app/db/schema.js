import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum} from "drizzle-orm/pg-core";

// Role enum for PostgreSQL
export const roleEnum = pgEnum("role", ["customer", "seller", "admin"]);

export const users = pgTable("user",{
    id: uuid('id').primaryKey().defaultRandom(),
    // id: serial('id').primaryKey(),
    name : varchar('name', {length:45}).notNull(),
    email : varchar('email', {length:322}).notNull().unique(),
    password : varchar('password', {length:66}).notNull(),
    salt: varchar('salt', {length: 255}),
    role: roleEnum('role').default('customer').notNull(),

    isVerified : boolean('is_verified').default(false).notNull(),

    verificationToken : text('verification_token'),
    verificationTokenExpires: timestamp('verification_token_expires'),
    refreshToken: varchar('refresh_token', { length: 500 }),
    
    resetPasswordToken: varchar('reset_password_token', { length: 255 }),
    resetPasswordExpires: timestamp('reset_password_expires'),

    createdAt : timestamp('created_at').defaultNow().notNull(),
    updatedAt : timestamp('updated_at').$onUpdate(()=> new Date())

})

// export const updateUserSchema = users.partial;