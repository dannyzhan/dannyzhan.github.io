﻿// Static comments
// from: https://github.com/eduardoboucas/popcorn/blob/gh-pages/js/main.js 
(function ($) {
    var $comments = $('.js-comments');
    var user_name = window.localStorage.getItem("comment-form-name");
    if (user_name) {
        $('#comment-form-name').val(user_name);
    }
    var user_email = window.localStorage.getItem("comment-form-email");
    if (user_email) {
        $('#comment-form-email').val(user_email);
    }

    //get client IP
    //we can query IP information here: https://ipinfo.io/
    $.ajax({
        type: 'get',
        url: 'https://api.ipify.org?format=json',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {            
            $('#comment-client-ip').val(data.ip);
        },
        error: function (err) {
            console.log(err);
        }
    });

    $('.js-form').submit(function () {
        var form = this;

        $('.form__spinner').addClass('form--loading');
        $('.submit__button').attr("disabled", true);

        $.ajax({
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize(),
            contentType: 'application/x-www-form-urlencoded',
            success: function (data) {
                //        showModal('成功', '恭喜，点评成功! 请在1分钟后刷新浏览器以查看你的点评.');
                showModal('成功', '谢谢，你的点评已成功提交! 在审核通过后将在本页面显示, 请耐心等待.');
                $('.form__spinner').removeClass('form--loading');
                $('.submit__button').attr("disabled", false);
                window.localStorage.setItem("comment-form-name", $("#comment-form-name").val());
                window.localStorage.setItem("comment-form-email", $("#comment-form-email").val());
                $('#comment-form-message').val('');
            },
            error: function (err) {
                console.log(err);
                var errorMessage = '';
                if (err && err.responseJSON) {
                    if (err.responseJSON.errorCode) {
                        errorMessage = err.responseJSON.errorCode;
                    } else if (err.responseJSON.error.text && err.responseJSON.error.nextValidRequestDate) {
                        errorMessage = err.responseJSON.error.text + 'Next valid request date:' + err.responseJSON.error.nextValidRequestDate;
                    }
                }
                showModal('错误', '对不起, 提交评论时发生错误. ' + errorMessage);
                $('.form__spinner').removeClass('form--loading');
                $('.submit__button').attr("disabled", false);
            }
        });
        return false;
    });

    $('.js-close-modal').click(function () {
        $('.js-notice').addClass('hidden');
    });

    function showModal(title, message) {
        $('.js-modal-title').text(title);
        $('.js-modal-text').html(message);
        $('.js-notice').removeClass('hidden');
    }
})(jQuery);

// Staticman comment replies, from https://github.com/mmistakes/made-mistakes-jekyll
// modified from Wordpress https://core.svn.wordpress.org/trunk/wp-includes/js/comment-reply.js
// Released under the GNU General Public License - https://wordpress.org/about/gpl/
// addComment.moveForm is called from comment.html when the reply link is clicked.
var addComment = {
    moveForm: function (commId, parentId, respondId, postId) {
        var div, element, style, cssHidden,
            t = this,                    //t is the addComment object, with functions moveForm and I, and variable respondId
            comm = t.I(commId),                                //whole comment
            respond = t.I(respondId),                             //whole new comment form
            cancel = t.I('cancel-comment-reply-link'),           //whole reply cancel link
            parent = t.I('comment-replying-to'),                 //a hidden element in the comment
            post = t.I('comment-post-slug'),                   //null
            commentForm = respond.getElementsByTagName('form')[0];    //the <form> part of the comment_form div

        if (!comm || !respond || !cancel || !parent || !commentForm) {
            return;
        }

        t.respondId = respondId;
        postId = postId || false;

        if (!t.I('sm-temp-form-div')) {
            div = document.createElement('div');
            div.id = 'sm-temp-form-div';
            div.style.display = 'none';
            respond.parentNode.insertBefore(div, respond); //create and insert a bookmark div right before comment form
        }

        comm.parentNode.insertBefore(respond, comm.nextSibling);  //move the form from the bottom to above the next sibling
        if (post && postId) {
            post.value = postId;
        }
        parent.value = parentId;
        cancel.style.display = '';                        //make the cancel link visible

        cancel.onclick = function () {
            var t = addComment,
                temp = t.I('sm-temp-form-div'),            //temp is the original bookmark
                respond = t.I(t.respondId);                   //respond is the comment form

            if (!temp || !respond) {
                return;
            }

            t.I('comment-replying-to').value = null;      //forget the name of the comment
            temp.parentNode.insertBefore(respond, temp);  //move the comment form to its original location
            temp.parentNode.removeChild(temp);            //remove the bookmark div
            this.style.display = 'none';                    //make the cancel link invisible
            this.onclick = null;                            //retire the onclick handler
            return false;
        };

        /*
         * Set initial focus to the first form focusable element.
         * Try/catch used just to avoid errors in IE 7- which return visibility
         * 'inherit' when the visibility value is inherited from an ancestor.
         */
        try {
            for (var i = 0; i < commentForm.elements.length; i++) {
                element = commentForm.elements[i];
                cssHidden = false;

                // Modern browsers.
                if ('getComputedStyle' in window) {
                    style = window.getComputedStyle(element);
                    // IE 8.
                } else if (document.documentElement.currentStyle) {
                    style = element.currentStyle;
                }

                /*
                 * For display none, do the same thing jQuery does. For visibility,
                 * check the element computed style since browsers are already doing
                 * the job for us. In fact, the visibility computed style is the actual
                 * computed value and already takes into account the element ancestors.
                 */
                if ((element.offsetWidth <= 0 && element.offsetHeight <= 0) || style.visibility === 'hidden') {
                    cssHidden = true;
                }

                // Skip form elements that are hidden or disabled.
                if ('hidden' === element.type || element.disabled || cssHidden) {
                    continue;
                }

                element.focus();
                // Stop after the first focusable element.
                break;
            }

        } catch (er) { }

        return false;
    },

    I: function (id) {
        return document.getElementById(id);
    }
};