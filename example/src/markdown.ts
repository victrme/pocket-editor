export const markdown = `## Move Elements

-   Pour activer le mode Move, shift + m ou cliquer sur Open grid mover dans les paramètres

### Layouts

Les layouts agissent comme des profiles, ils gardent en mémoire:

-   les alignements
-   les movements sur la grille
-   les élements activé / désactivé

### Fill column & fill row

Elle rend Move Elements vraiment plus complexe à gérer, mais je trouve que c'est worth it.

[ ] Ya pas de mémoire alors quand on désactive le fill, ça positionne l'élement a sa première position sur la grille. Comportement un peu bizarre quand on active / désactive le même élement et qu'il se déplace tout seul...
[ ] Le fill est soit row soit col, parce que gérer des carrés dans une grille c'est dur.
[x] Quand on active un element qui prend la place d'un autre qui est fill, ça supprime son fill.

### Reset layout

Reset réinitialise qu'un seul layout à la fois, pour pouvoir garder les autres. Le reset prend en compte les elements actifs et les place comme indiqué au-dessus.`

export default markdown
