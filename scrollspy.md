# Scrollspy
A scrollspy has a number of requirements:
1. Link to in-page anchors
1. Handle click events
1. Handle scroll events
1. Manage the URL hash
1. Manage the active state of menu links

## Click Event
You can link to any element in-page by giving it an ID or a “name” attribute.
Hypothetically, the “name” attribute is more “correct” because it is designed for
in-page links. But using the ID simplifies accising elements with JQuery. The
link href for an element is the ID (or name) preceeded with a hash #.

Although you can link to any element, I think it is best to use an actual anchor
as the target. This give you a bit more control. Also, since there may be menu items
that don’t link to in-page locations, it is good practice to give those links a
special class, such as “in-page” or “scrolling.” I like this better than the
frequent technique of targetting menu items that begin with a hash, e.g. using
a special selector: `$('a[href*=^#]')`. I like it for being more explicit.

Because we want menu items to show as active when we scroll to the associated page
locations, we need a class (e.g. ‘active’) to show them as active. A CSS styling
for `:active` can handle links that are clicked, but not for scrolling events.
So, rather than using both and making sure they are always in sync, I prefert to
skip the pseudo-class and handle clicks and scrolls with a special class and
JQuery.

Finally, it is customary to smooth the transition between sections when menu
links are clicked by animating the scrollTop action. This fires off a barrage
of scrolling events. It’s not really a problem, but for the sake of efficiency,
I include a flag letting the windoe.scrollevent know if the scrolling is
user-initiated, or if it’s from the animation.

## Scroll Event
This is the key feature of a scrollspy (hence the name). A scrollspy captures the
scroll event and determines the page location. If an anchor (e.g. heading) is at
some specified height on the page, the scrolling handler takes care of two tasks: 1) 
sets the corresponding link as active (as though it was clicked), 2) sets the
URL hash, and 3) updates the page history.

In my scrollspy, the first thing I do is check if the scrolling is from a link
animation. If it is, I just return. If it is a natural scoll event, I calculate
the vertical distance each anchor is from a certain window position called the
`FOCUS_HEIGHT` because it determines when an anchor (and its section) is in focus.
Window location in pixels increases down the page, so anchors below the `FOCUS_HEIGHT`
have a positive distance, and those above have a negative distance.

After each scroll event, the anchor closest to the focus line from below (i.e. the
smallest positive distance) is determined to be in focus. If this anchor has
changed, then we assume we have reached a new section. We set the menu item to be
active and update the hash.

## Managing the URL
There are two ways to manage the URL. You can update the hash by setting the
`window.location.hash` property directly. This does not affec the
