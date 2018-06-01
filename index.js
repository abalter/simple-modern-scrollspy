const FOCUS_HEIGHT = 150;
const SCROLL_DURATION = 500;
let click; // to indicate whether scroll_link was from a click

function spyOnScroll()
{

    let $scroll_links = $('.scroll_link');
    console.log("scroll links: ", $scroll_links);

    /*
        Clicking on a link causes the page to scroll. So we use
        the "click" variable to check if that is the reason for
        scroll_link, and in that case preventDefault of the scroll
        event.


    */
    $scroll_links.on('click', function(e)
    {
        click = true;
        let hash = $(e.target).attr('href');
        console.log("clicked hash", hash);
        $('html').animate
        (
            {
                // This uses the ID of the scrollto, so that the selector for
                // an scrollto with ID "section" is `.scrollto#section`. The "#"
                // we get for free from the hash.
                scrollTop: $('.scrollto' + hash).position().top,
            },
            {
                duration: SCROLL_DURATION,
                complete: function()
                {
                    // When animation is done, set click back to false so that
                    // scroll_link can tricker hash changes.
                    click = false;
                    console.log("finished. click: " + click);
                    $('.scroll_link[href="' + hash + '"]').addClass('active'); // make link active
                    $('.scroll_link[href!="' + hash + '"]').removeClass('active'); //make all others not active
                }
            },
        );
    });

    // jquery returns a jquery object, so we need to coerce to array
    let hashes = Array.from($scroll_links).map(link => link.hash);
    hashes = [...hashes];
    console.log("hashes", hashes);

    /*
        It will be useful to have a structure containing the hash and associated
        page position so that we can access both the hash and position with a single
        index.

        The positions of the scrolltos are relative to the page, not the window. They do
        not change during scroll_link.
    */
    let anchors = hashes.map( (hash) =>
    {
        console.log("hash", hash);
        let obj =
        {
            'hash': hash,
            'position': $('.scrollto'+hash).position().top
        }

        return obj;
    });
    /*
        To insure that the bottommost scrollto scrollto can go in and out of focus,
        we need to create a dummy scrollto basically at infinity
    */
    anchors = [...anchors, {'hash':'none', 'position': 10**1000}];
    /*
        The scroll_link algorithm assums that scroll links with smaller indices (basically
        left-to-right) are also higher up on the page. But there is no guarantee that the
        links have been put in the nav menu in that order. So, can't hurt to sort them
        by page position.
    */
    anchors = anchors.sort((A, B) => A.position - B.position);
    console.log("anchors", anchors);
    console.log("anchors: ", anchors);


    /*
        Page may get loaded with a slug. In which case, the
        current hash is given by window.location.hash. However
        if the page loads with no slug, then we assume the
        initial hash is the top-most. This is the hash that
        has the smallest corresponding position.
    */
    let current_hash = window.location.hash;
    if (current_hash == '')
    {
        current_hash = hashes[0];
    }

    /*
        The "current" and "new" index and hash will be used to tell if they have
        changed. Only need to update the hash if there is a change.
    */
    let new_hash = current_hash;
    let current_index = hashes.indexOf(current_hash);
    let new_index = current_index;
    console.log("current hash=" + current_hash, "current_index", current_index);


    $(window).scroll(function(e)
    {
        console.log("scroll_link...");

        if (click)
        {
            console.log("scrolled due to click...returning");
            e.preventDefault();
            return;
        }

        let window_position = $(window).scrollTop();

        /*
            A little math...
            The window position is location of the page visible at the top of the
            WINDOW. The scrollto position a.position is the height of the scrollto on
            the PAGE. If the scrollto is below the top of the window, then it has a
            LARGER vertical coordinate (the coordinate increases down the page).
            So, a.position - window_position will be a positive number. Since we
            want the hash to change when the scrollto is in focus, not just entering
            the window, so we also subtract off `FOCUS_HEIGHT`. The first scrollto
            to satisfy the condition

                `a.position - window_position - FOCUS_HEIGHT > 0`

            will get picked up by `indexOf`. This is the index for the scrollto
            currently in focus.
        */
        new_index = anchors.map( a => a.position - window_position - FOCUS_HEIGHT > 0).indexOf(true);
        console.log("current_index", current_index, "new_index", new_index);
        console.log("hashes", hashes);

        if (new_index != current_index) // a new section is in focus
        {
            new_hash = hashes[new_index - 1];
            current_hash = new_hash;
            current_index = new_index;

            console.log("new hash=" + new_hash + " current hash=" + current_hash);
            $('.menu-item[href="' + new_hash + '"]').addClass('active'); // make link active
            $('.menu-item[href!="' + new_hash + '"]').removeClass('active'); //make all others not active
            console.log("setting hash");
            window.history.pushState(null, null, new_hash);
        }
    });
}

$(window).on('load', spyOnScroll);
