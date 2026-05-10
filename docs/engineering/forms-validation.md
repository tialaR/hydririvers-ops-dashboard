# Forms Validation

## Standard
- Use Zod for validation schemas.
- Derive form input/output types with `z.infer`.
- Use React Hook Form when the form has multiple fields, validation, or submission state.
- Use `zodResolver` to connect schema and form state.

## Error messages
- Keep messages short, clear, and human.
- Explain what the user needs to do next.
- Keep errors visible near the field and link them with `aria-describedby`.

## Form guidance
- Login, register, OTP, cargo creation, profile edits, and advanced filters should use schemas.
- Simple visual toggles can remain on local state.
- Validate input coming from storage or URL params before using it.

## Example
```ts
const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Digite um e-mail válido.'),
});

type Input = z.infer<typeof schema>;
```
