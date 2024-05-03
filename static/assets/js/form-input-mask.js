(function() {
    'use strict';

    if(document.getElementsByClassName('delimiter').length > 0){
        /* delimeter */
        var d1 = new Cleave('.delimiter', {
            delimiter: '-',
            blocks: [5, 5, 5, 5],
            uppercase: true
        });
    }
})();