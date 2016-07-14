

module.exports = function(opt) {
    var a = document.createElement('a');

    a.href = opt.href;
    a.innerHTML = opt.html;

    return a;
};

