# Layout Refactor Log

## src/components/GameBoard.tsx
- **Original:** Two nested <Box> with flex, fixed maxWidth, 2+1 option layout.
- **Revised:** Uses <ResponsiveOptionGrid count={question.options.length}> for all options, responsive columns.

## src/app/games/shapes/sorter/page.tsx
- **Original:** MUI <Grid> with xs=3, always 3+1 layout for 4 items.
- **Revised:** Uses <ResponsiveOptionGrid count={SHAPES.length}> for both draggable and drop target areas.

## src/app/page.tsx (Home)
- **Original:** <Box display='grid' gridTemplateColumns={...}> for game cards.
- **Revised:** Uses <ResponsiveOptionGrid count={gameCount}> for cards.

## src/app/games/geography/states/page.tsx
- **Original:** <Box display='grid' gridTemplateColumns={...}> for state cards.
- **Revised:** Uses <ResponsiveOptionGrid count={states.length}> for state cards.

## src/app/games/geography/continents/page.tsx
- **Original:** <Box display='grid' gridTemplateColumns={...}> for continent cards.
- **Revised:** Uses <ResponsiveOptionGrid count={continents.length}> for continent cards. 