# Storybook readiness

## Já prontos para histórias

- Button
- Badge
- Card
- BottomSheet
- Tooltip
- ThemeToggle
- LocaleSwitcher
- PageShell

## Ainda precisam de ajuste

- componentes que dependem de contexto de feature;
- componentes que carregam mocks internos;
- componentes que usam estado global implícito.

## Convenção sugerida

```tsx
Button.stories.tsx
Card.stories.tsx
BottomSheet.stories.tsx
Dropdown.stories.tsx
```

## Boas práticas

- uma história por variante importante;
- documentar estados de foco, disabled e mobile;
- evitar dependência de dados de produção;
- manter stories pequenas e legíveis.
