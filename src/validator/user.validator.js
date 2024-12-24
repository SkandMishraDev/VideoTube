import z from "zod"

const signUpSchema=z.object({
    userName:z.string(),
    email:z.string().email(),
    // avatar:z.string().url(),
    // coverImage: z.string().optional(),
    password:z.string()
})

const signInSchema = z.union([
    z.object({
      username: z.string(),
      email: z.undefined(), // email must not be present
      password: z.string(),
    }),
    z.object({
      email: z.string().email(),
      username: z.undefined(), // username must not be present
      password: z.string(),
    }),
  ]);

export {signUpSchema,signInSchema}

