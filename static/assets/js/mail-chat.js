(function () {
    "use strict";

    var myElement11 = document.getElementById('mail-main-nav');
    new SimpleBar(myElement11, { autoHide: true });
    
    var myElement13 = document.getElementById('mail-info-body');
    new SimpleBar(myElement13, { autoHide: true });

    var myElement14 = document.getElementById('mail-recepients');
    new SimpleBar(myElement14, { autoHide: true });

    /* mail editor */
    var toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'align': [] }],

        ['image', 'video'],
        ['clean']                                         // remove formatting button
    ];
    var quill = new Quill('#mail-reply-editor', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    /* to choices js */
    const multipleCancelButton = new Choices(
        '#toMail',
        {
            allowHTML: true,
            removeItemButton: true,
        });
    
})();