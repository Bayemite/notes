const navbar = `
<a href='javascript:void(0)' onclick='homePage()'>Home</a>
&nbsp;|&nbsp;
<a href='javascript:void(0)' onclick='newNote()'>New</a>
<br><br>
`;

window.onkeydown = keydown;

let params = new URLSearchParams(document.location.search);
let id = params.get('id');

if (id === null) { homePage(); }
else { notePage(id); }

function notePage(id) {
    history.replaceState({}, '', `index.html?id=${id}`);

    document.body.innerHTML = navbar + '<div contenteditable id="content"></div>';

    let content = document.getElementById('content');
    content.focus();

    content.innerHTML = localStorage.getItem(`note-${id}`);

    content.oninput = input;
    window.onbeforeunload = update;

    function updateTitle() {
        let text = content.innerText;
        let i = text.indexOf('\n');
        if (i == -1) i = undefined;

        let title = text.substring(0, i);
        if (title.trim() == '') title = 'Untitled';

        document.title = title;
        let metadata = { title: title };
        localStorage.setItem(`note-${id}-metadata`, JSON.stringify(metadata));
    }
    updateTitle();

    function update() {
        updateTitle();
        localStorage.setItem(`note-${id}`, content.innerHTML);
    };

    let throttle;
    function input() {
        if (throttle)
            return;

        throttle = setTimeout(update, 500);
        throttle = undefined;
    }
}

function homePage() {
    history.replaceState({}, '', 'index.html');

    let nextId = Number(localStorage.getItem('next-id'));
    if (nextId === null)
        nextId = 0;
    let notesList = '';

    for (let i = 0; i < nextId; i++) {
        let metadata = JSON.parse(localStorage.getItem(`note-${i}-metadata`));
        if (metadata === null)
            continue;
        notesList += `${i}. <a href='javascript:void(0)' onclick='notePage(${i})'>${metadata.title}</a><br>`;
    }
    if (nextId > 0)
        notesList += '<br>';

    document.title = 'Notes';
    document.body.innerHTML = `
        ${navbar}
        ${notesList}
        Notes are stored in localStorage.<br>
        A note's title is its first line.<br>
        <br>
        Shortcuts:<br>
        Home: Alt+H<br>
        New: Alt+N<br>
    `;
}

function newNote() {
    let next = localStorage.getItem('next-id');
    if (next === null)
        next = '0';

    localStorage.setItem('next-id', `${Number(next) + 1}`);
    notePage(next);
}

function keydown(e) {
    if (e.altKey) {
        if (e.key == 'n') {
            newNote();
        }
        else if (e.key == 'h' && location.search != '') {
            homePage();
        }
    }
}