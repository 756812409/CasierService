/*
 Style HTML
 ---------------
 Written by Nochum Sossonko, (nsossonko@hotmail.com)
 Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
 http://jsbeautifier.org/
 You are free to use this in any way you want, in case you find this useful or working for you.
 Usage:
 style_html(html_source);
 style_html(html_source, options);
 The options are:
 indent_size (default 4)          â€” indentation size,
 indent_char (default space)      â€” character to indent with,
 max_char (default 70)            -  maximum amount of characters per line,
 brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
 put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
 unformatted (default ['a'])      - list of tags, that shouldn't be reformatted
 indent_scripts (default normal)  - "keep"|"separate"|"normal"
 e.g.
 style_html(html_source, {
 'indent_size': 2,
 'indent_char': ' ',
 'max_char': 78,
 'brace_style': 'expand',
 'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
 });
 */

function style_html(html_source, options) {
    //Wrapper function to invoke all the necessary constructors and deal with the output.

    var multi_parser,
      indent_size,
      indent_character,
      max_char,
      brace_style;

    options = options || {};
    indent_size = options.indent_size || 4;
    indent_character = options.indent_char || ' ';
    brace_style = options.brace_style || 'collapse';
    max_char = options.max_char == 0 ? Infinity : options.max_char || 70;
    unformatted = options.unformatted || ['a'];

    function Parser() {

        this.pos = 0; //Parser position
        this.token = '';
        this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
        this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
            parent: 'parent1',
            parentcount: 1,
            parent1: ''
        };
        this.tag_type = '';
        this.token_text = this.last_token = this.last_text = this.token_type = '';

        this.Utils = { //Uilities made available to the various functions
            whitespace: "\n\r\t ".split(''),
            single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','), //all the single tags for HTML
            extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
            in_array: function (what, arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (what === arr[i]) {
                        return true;
                    }
                }
                return false;
            }
        }

        this.get_content = function () { //function to capture regular content between tags

            var input_char = '';
            var content = [];
            var space = false; //if a space is needed
            while (this.input.charAt(this.pos) !== '<') {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }

                input_char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;

                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    if (content.length) {
                        space = true;
                    }
                    this.line_char_count--;
                    continue; //don't want to insert unnecessary space
                }
                else if (space) {
                    if (this.line_char_count >= this.max_char) { //insert a line when the max_char is reached
                        content.push('\n');
                        for (var i = 0; i < this.indent_level; i++) {
                            content.push(this.indent_string);
                        }
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(input_char); //letter at-a-time (or string) inserted to an array
            }
            return content.length ? content.join('') : '';
        }

        this.get_contents_to = function (name) { //get the full content of a script or style to pass to js_beautify
            if (this.pos == this.input.length) {
                return ['', 'TK_EOF'];
            }
            var input_char = '';
            var content = '';
            var reg_match = new RegExp('\<\/' + name + '\\s*\>', 'igm');
            reg_match.lastIndex = this.pos;
            var reg_array = reg_match.exec(this.input);
            var end_script = reg_array ? reg_array.index : this.input.length; //absolute end of script
            if (this.pos < end_script) { //get everything in between the script tags
                content = this.input.substring(this.pos, end_script);
                this.pos = end_script;
            }
            return content;
        }

        this.record_tag = function (tag) { //function to record a tag and its parent in this.tags Object
            if (this.tags[tag + 'count']) { //check for the existence of this tag type
                this.tags[tag + 'count']++;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
            }
            else { //otherwise initialize this tag type
                this.tags[tag + 'count'] = 1;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
            }
            this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
            this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
        }

        this.retrieve_tag = function (tag) { //function to retrieve the opening tag to the corresponding closer
            if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
                var temp_parent = this.tags.parent; //check to see if it's a closable tag.
                while (temp_parent) { //till we reach '' (the initial value);
                    if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
                        break;
                    }
                    temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
                }
                if (temp_parent) { //if we caught something
                    this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
                    this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
                }
                delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
                delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
                if (this.tags[tag + 'count'] == 1) {
                    delete this.tags[tag + 'count'];
                }
                else {
                    this.tags[tag + 'count']--;
                }
            }
        }

        this.get_tag = function () { //function to get a full tag and parse its type
            var input_char = '';
            var content = [];
            var space = false;

            do {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }

                input_char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;

                if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
                    space = true;
                    this.line_char_count--;
                    continue;
                }

                if (input_char === "'" || input_char === '"') {
                    if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
                        input_char += this.get_unformatted(input_char);
                        space = true;
                    }
                }

                if (input_char === '=') { //no space before =
                    space = false;
                }

                if (content.length && content[content.length - 1] !== '=' && input_char !== '>'
                  && space) { //no space after = or before >
                    if (this.line_char_count >= this.max_char) {
                        this.print_newline(false, content);
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(input_char); //inserts character at-a-time (or string)
            } while (input_char !== '>');

            var tag_complete = content.join('');
            var tag_index;
            if (tag_complete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
                tag_index = tag_complete.indexOf(' ');
            }
            else { //otherwise go with the tag ending
                tag_index = tag_complete.indexOf('>');
            }
            var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
            if (tag_complete.charAt(tag_complete.length - 2) === '/' ||
              this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
                this.tag_type = 'SINGLE';
            }
            else if (tag_check === 'script') { //for later script handling
                this.record_tag(tag_check);
                this.tag_type = 'SCRIPT';
            }
            else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
                this.record_tag(tag_check);
                this.tag_type = 'STYLE';
            }
            else if (this.Utils.in_array(tag_check, unformatted)) { // do not reformat the "unformatted" tags
                var comment = this.get_unformatted('</' + tag_check + '>', tag_complete); //...delegate to get_unformatted function
                content.push(comment);
                this.tag_type = 'SINGLE';
            }
            else if (tag_check.charAt(0) === '!') { //peek for <!-- comment
                if (tag_check.indexOf('[if') != -1) { //peek for <!--[if conditional comment
                    if (tag_complete.indexOf('!IE') != -1) { //this type needs a closing --> so...
                        var comment = this.get_unformatted('-->', tag_complete); //...delegate to get_unformatted
                        content.push(comment);
                    }
                    this.tag_type = 'START';
                }
                else if (tag_check.indexOf('[endif') != -1) {//peek for <!--[endif end conditional comment
                    this.tag_type = 'END';
                    this.unindent();
                }
                else if (tag_check.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
                    var comment = this.get_unformatted(']]>', tag_complete); //...delegate to get_unformatted function
                    content.push(comment);
                    this.tag_type = 'SINGLE'; //<![CDATA[ comments are treated like single tags
                }
                else {
                    var comment = this.get_unformatted('-->', tag_complete);
                    content.push(comment);
                    this.tag_type = 'SINGLE';
                }
            }
            else {
                if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
                    this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
                    this.tag_type = 'END';
                }
                else { //otherwise it's a start-tag
                    this.record_tag(tag_check); //push it on the tag stack
                    this.tag_type = 'START';
                }
                if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
                    this.print_newline(true, this.output);
                }
            }
            return content.join(''); //returns fully formatted tag
        }

        this.get_unformatted = function (delimiter, orig_tag) { //function to return unformatted content in its entirety

            if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
                return '';
            }
            var input_char = '';
            var content = '';
            var space = true;
            do {

                if (this.pos >= this.input.length) {
                    return content;
                }

                input_char = this.input.charAt(this.pos);
                this.pos++

                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    if (!space) {
                        this.line_char_count--;
                        continue;
                    }
                    if (input_char === '\n' || input_char === '\r') {
                        content += '\n';
                        /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
                         for (var i=0; i<this.indent_level; i++) {
                         content += this.indent_string;
                         }
                         space = false; //...and make sure other indentation is erased
                         */
                        this.line_char_count = 0;
                        continue;
                    }
                }
                content += input_char;
                this.line_char_count++;
                space = true;


            } while (content.indexOf(delimiter) == -1);
            return content;
        }

        this.get_token = function () { //initial handler for token-retrieval
            var token;

            if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
                var type = this.last_token.substr(7)
                token = this.get_contents_to(type);
                if (typeof token !== 'string') {
                    return token;
                }
                return [token, 'TK_' + type];
            }
            if (this.current_mode === 'CONTENT') {
                token = this.get_content();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    return [token, 'TK_CONTENT'];
                }
            }

            if (this.current_mode === 'TAG') {
                token = this.get_tag();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    var tag_name_type = 'TK_TAG_' + this.tag_type;
                    return [token, tag_name_type];
                }
            }
        }

        this.get_full_indent = function (level) {
            level = this.indent_level + level || 0;
            if (level < 1)
                return '';

            return Array(level + 1).join(this.indent_string);
        }


        this.printer = function (js_source, indent_character, indent_size, max_char, brace_style) { //handles input/output and some other printing functions

            this.input = js_source || ''; //gets the input for the Parser
            this.output = [];
            this.indent_character = indent_character;
            this.indent_string = '';
            this.indent_size = indent_size;
            this.brace_style = brace_style;
            this.indent_level = 0;
            this.max_char = max_char;
            this.line_char_count = 0; //count to see if max_char was exceeded

            for (var i = 0; i < this.indent_size; i++) {
                this.indent_string += this.indent_character;
            }

            this.print_newline = function (ignore, arr) {
                this.line_char_count = 0;
                if (!arr || !arr.length) {
                    return;
                }
                if (!ignore) { //we might want the extra line
                    while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
                        arr.pop();
                    }
                }
                arr.push('\n');
                for (var i = 0; i < this.indent_level; i++) {
                    arr.push(this.indent_string);
                }
            }

            this.print_token = function (text) {
                this.output.push(text);
            }

            this.indent = function () {
                this.indent_level++;
            }

            this.unindent = function () {
                if (this.indent_level > 0) {
                    this.indent_level--;
                }
            }
        }
        return this;
    }

    /*_____________________--------------------_____________________*/

    multi_parser = new Parser(); //wrapping functions Parser
    multi_parser.printer(html_source, indent_character, indent_size, max_char, brace_style); //initialize starting values

    while (true) {
        var t = multi_parser.get_token();
        multi_parser.token_text = t[0];
        multi_parser.token_type = t[1];

        if (multi_parser.token_type === 'TK_EOF') {
            break;
        }

        switch (multi_parser.token_type) {
            case 'TK_TAG_START':
                multi_parser.print_newline(false, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.indent();
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_TAG_STYLE':
            case 'TK_TAG_SCRIPT':
                multi_parser.print_newline(false, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_TAG_END':
                //Print new line only if the tag has no content and has child
                if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
                    var tag_name = multi_parser.token_text.match(/\w+/)[0];
                    var tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/<\s*(\w+)/);
                    if (tag_extracted_from_last_output === null || tag_extracted_from_last_output[1] !== tag_name)
                        multi_parser.print_newline(true, multi_parser.output);
                }
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_TAG_SINGLE':
                multi_parser.print_newline(false, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_CONTENT':
                if (multi_parser.token_text !== '') {
                    multi_parser.print_token(multi_parser.token_text);
                }
                multi_parser.current_mode = 'TAG';
                break;
            case 'TK_STYLE':
            case 'TK_SCRIPT':
                if (multi_parser.token_text !== '') {
                    multi_parser.output.push('\n');
                    var text = multi_parser.token_text;
                    if (multi_parser.token_type == 'TK_SCRIPT') {
                        var _beautifier = typeof js_beautify == 'function' && js_beautify;
                    } else if (multi_parser.token_type == 'TK_STYLE') {
                        var _beautifier = typeof css_beautify == 'function' && css_beautify;
                    }

                    if (options.indent_scripts == "keep") {
                        var script_indent_level = 0;
                    } else if (options.indent_scripts == "separate") {
                        var script_indent_level = -multi_parser.indent_level;
                    } else {
                        var script_indent_level = 1;
                    }

                    var indentation = multi_parser.get_full_indent(script_indent_level);
                    if (_beautifier) {
                        // call the Beautifier if avaliable
                        text = _beautifier(text.replace(/^\s*/, indentation), options);
                    } else {
                        // simply indent the string otherwise
                        var white = text.match(/^\s*/)[0];
                        var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
                        var reindent = multi_parser.get_full_indent(script_indent_level - _level);
                        text = text.replace(/^\s*/, indentation)
                          .replace(/\r\n|\r|\n/g, '\n' + reindent)
                          .replace(/\s*$/, '');
                    }
                    if (text) {
                        multi_parser.print_token(text);
                        multi_parser.print_newline(true, multi_parser.output);
                    }
                }
                multi_parser.current_mode = 'TAG';
                break;
        }
        multi_parser.last_token = multi_parser.token_type;
        multi_parser.last_text = multi_parser.token_text;
    }
    return multi_parser.output.join('');
}
(function (moment) {
    'use strict';
    var moduleName = "ngMaterialDatePicker";

    var VIEW_STATES = {
        DATE: 0,
        HOUR: 1,
        MINUTE: 2
    };

    var css = function (el, name) {
        if ('jQuery' in window) {
            return jQuery(el).css(name);
        } else {
            el = angular.element(el);
            return ('getComputedStyle' in window) ? window.getComputedStyle(el[0])[name] : el.css(name);
        }
    };

    var template = '<md-dialog class="dtp" layout="column" style="width: 300px;">'
      + '  <md-toolbar><div class="md-toolbar-tools dtp-header">'
      + '   <md-button class="md-icon-button" aria-label="extended datetime picker">'
      + '        <md-icon>event_note</md-icon>'
      + '      </md-button>'
      + '      <h2>{{picker.currentDate.format("dddd")}}, {{picker.currentDate.format("MMMM")}} {{picker.currentDate.format("DD")}} <br/>'
      + '      week# {{picker.currentDate.isoWeek()}} @ {{picker.currentNearest5Minute().format(picker.params.shortTime ? "hh:mm" : "HH:mm")}}</h2>'
      + '     <md-button class="md-icon-button" ng-click="picker.hide()"><md-icon>close</md-icon><md-tooltip>Close</md-tooltip></md-button></div></md-toolbar>'
      + '   <md-divider></md-divider>'
      + '    <md-dialog-content class="dtp-content">'
      + '        <div class="dtp-date-view">'
      + '            <div class="dtp-date" ng-show="picker.params.date">'
      + '                <div layout="row">'
      + ' <div ng-click="picker.incrementYear(-1)" class="dtp-year-btn dtp-year-btn-prev" flex="30"><span ng-if="picker.isPreviousYearVisible()" >&#x25B2;</span></div>'
      + '                    <div class="dtp-actual-year" flex>{{picker.currentDate.format("YYYY")}}</div>'
      + ' <div ng-click="picker.incrementYear(1)" class="dtp-year-btn dtp-year-btn-next" flex="30"><span ng-if="picker.isNextYearVisible()" >&#x25BC;</span></div>'
      + '                </div>'
      + '            </div>'//start time
      + '            <div class="dtp-time" ng-show="picker.params.time && !picker.params.date">'
      + '                <div class="dtp-actual-maxtime">{{picker.currentNearest5Minute().format(picker.params.shortTime ? "hh:mm" : "HH:mm")}}</div>'
      + '            </div>'
      + '            <div class="dtp-picker">'
      + '                <mdc-datetime-picker-calendar date="picker.currentDate" picker="picker" class="dtp-picker-calendar" ng-show="picker.currentView === picker.VIEWS.DATE"></mdc-datetime-picker-calendar>'
      + '                <div class="dtp-picker-datetime" ng-show="picker.currentView !== picker.VIEWS.DATE">'
      + '                    <div class="dtp-actual-meridien">'
      + '                        <div class="left p20">'
      + '                            <a href="#" mdc-dtp-noclick class="dtp-meridien-am" ng-class="{selected: picker.meridien == \'AM\'}" ng-click="picker.selectAM()">{{picker.params.amText}}</a>'
      + '                        </div>'
      + '                        <div ng-show="!picker.timeMode" class="dtp-actual-time p60">{{picker.currentNearest5Minute().format(picker.params.shortTime ? "hh:mm" : "HH:mm")}}</div>'
      + '                        <div class="right p20">'
      + '                            <a href="#" mdc-dtp-noclick class="dtp-meridien-pm" ng-class="{selected: picker.meridien == \'PM\'}" ng-click="picker.selectPM()">{{picker.params.pmText}}</a>'
      + '                        </div>'
      + '                        <div class="clearfix"></div>'
      + '                    </div>'
      + '                    <mdc-datetime-picker-clock mode="hours" ng-if="picker.currentView === picker.VIEWS.HOUR"></mdc-datetime-picker-clock>'
      + '                    <mdc-datetime-picker-clock mode="minutes" ng-if="picker.currentView === picker.VIEWS.MINUTE"></mdc-datetime-picker-clock>'
      + '                </div>'
      + '            </div>'
      + '        </div>'
      + '    </md-dialog-content>'
      + '    <md-dialog-actions class="dtp-buttons" layout="row" layout-align="space-between end">'
      + '            <md-button class="dtp-btn-cancel md-icon-button" ng-click="picker.today()" ng-if="picker.currentView == picker.VIEWS.DATE">'
      + '             <md-tooltip md-direction="bottom"><em>Today: {{picker.todaysDate}} </em></md-tooltip>'
      + '             <md-icon>today</md-icon></md-button>'
      + '            <md-button class="dtp-btn-cancel md-button" ng-click="picker.cancel()"> {{picker.params.cancelText}}</md-button>'
      + '            <md-button class="dtp-btn-ok md-button" ng-click="picker.ok()"> {{picker.params.okText}}</md-button>'
      + '      </md-dialog-actions>'
      + '</md-dialog>';

    angular.module(moduleName, ['ngAnimate', 'ngMaterial'])
      .config(function ($mdIconProvider) {
          $mdIconProvider.defaultIconSet('', 24);
      })
      .provider('mdcDatetimePickerDefaultLocale', function () {
          var language = (navigator.language || navigator.userLanguage).slice(0, 2);
          this.locale = language;

          this.$get = function () {
              return this.locale;
          };

          this.setDefaultLocale = function (localeString) {
              this.locale = localeString;
          };
      })
      .directive('mdcDatetimePicker', ['$mdDialog',
        function ($mdDialog) {

            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    currentDate: '=ngModel',
                    time: '=',
                    date: '=',
                    minDate: '=',
                    maxDate: '=',
                    disableDates: '=',
                    weekDays: '=',
                    shortTime: '=',
                    format: '@',
                    cancelText: '@',
                    okText: '@',
                    lang: '@',
                    amText: '@',
                    pmText: '@'
                },
                link: function (scope, element, attrs, ngModel) {
                    var isOn = false;
                    if (!scope.format) {
                        if (scope.date && scope.time) {
                            scope.format = 'YYYY-MM-DD HH:mm:ss';
                        } else if (scope.date) {
                            scope.format = 'YYYY-MM-DD';
                        } else {
                            scope.format = 'HH:mm';
                        }
                    }

                    if (angular.isString(scope.currentDate) && scope.currentDate !== '') {
                        scope.currentDate = moment(scope.currentDate, scope.format);
                    }

                    if (ngModel) {
                        ngModel.$formatters.push(function (value) {
                            if (typeof value === 'undefined') {
                                return;
                            }
                            var m = moment(value);
                            return m.isValid() ? m.format(scope.format) : '';
                        });
                    }

                    element.attr('readonly', '');
                    //@TODO custom event to trigger input
                    element.on('focus', function (e) {
                        e.preventDefault();
                        element.blur();
                        if (isOn) {
                            return;
                        }
                        isOn = true;
                        var options = {};
                        for (var i in attrs) {
                            if (scope.hasOwnProperty(i) && !angular.isUndefined(scope[i])) {
                                options[i] = scope[i];
                            }
                        }
                        options.currentDate = scope.currentDate;
                        var locals = { options: options };
                        $mdDialog.show({
                            template: template,
                            controller: PluginController,
                            controllerAs: 'picker',
                            locals: locals,
                            openFrom: element,
                            parent: angular.element(document.body),
                            bindToController: true,
                            disableParentScroll: false,
                            skipHide: true,
                            clickOutsideToClose: true,
                            multiple: true
                        })
                          .then(function (v) {
                              scope.currentDate = v ? v._d : v;
                              isOn = false;
                          }, function () {
                              isOn = false;
                          })
                        ;
                    });
                }
            };
        }])
    ;

    var PluginController = function ($scope, $mdDialog, mdcDatetimePickerDefaultLocale) {
        this.currentView = VIEW_STATES.DATE;
        this._dialog = $mdDialog;

        this.minDate;
        this.maxDate;
        this.disableDates;
        this.weekDays;

        this._attachedEvents = [];
        this.VIEWS = VIEW_STATES;

        this.params = {
            date: true,
            time: true,
            format: 'YYYY-MM-DD',
            minDate: null,
            maxDate: null,
            currentDate: null,
            disableDates: [],
            weekDays: false,
            lang: mdcDatetimePickerDefaultLocale,
            weekStart: 0,
            shortTime: false,
            cancelText: 'Cancel',
            okText: 'OK',
            amText: 'AM',
            pmText: 'PM'
        };

        this.meridien = 'AM';
        this.params = angular.extend(this.params, this.options);
        this.init();
    };
    PluginController.$inject = ['$scope', '$mdDialog', 'mdcDatetimePickerDefaultLocale'];
    PluginController.prototype = {
        init: function () {
            this.timeMode = this.params.time && !this.params.date;
            this.dateMode = this.params.date;
            this.todaysDate = moment(Date.now()).format("YYYY-MM-DD");
            this.initDates();
            this.start();
        },
        currentNearest5Minute: function () {
            var date = this.currentDate || moment();
            var minutes = (5 * Math.round(date.minute() / 5));
            if (minutes >= 60) {
                minutes = 55; //always push down
            }
            return moment(date).minutes(minutes);
        },
        initDates: function () {
            var that = this;
            var _dateParam = function (input, fallback) {
                var ret = null;
                if (angular.isDefined(input) && input !== null && input !== '') {
                    if (angular.isString(input)) {
                        if (typeof (that.params.format) !== 'undefined' && that.params.format !== null) {
                            ret = moment(input, that.params.format).locale(that.params.lang);
                        }
                        else {
                            ret = moment(input).locale(that.params.lang);
                        }
                    }
                    else {
                        if (angular.isDate(input)) {
                            var x = input.getTime();
                            ret = moment(x, "x").locale(that.params.lang);
                        } else if (input._isAMomentObject) {
                            ret = input;
                        }
                    }
                }
                else {
                    ret = fallback;
                }
                return ret;
            };

            this.currentDate = _dateParam(this.params.currentDate, moment());
            this.minDate = _dateParam(this.params.minDate);
            this.maxDate = _dateParam(this.params.maxDate);
            this.disableDates = this.params.disableDates.map(function (x) {
                return moment(x).format('MMMM Do YYYY')
            });
            this.selectDate(this.currentDate);
            this.weekDays = this.params.weekDays;
        },
        initDate: function (d) {
            this.currentView = VIEW_STATES.DATE;
        },
        initHours: function () {
            this.currentView = VIEW_STATES.HOUR;
        },
        initMinutes: function () {
            this.currentView = VIEW_STATES.MINUTE;
        },
        isAfterMinDate: function (date, checkHour, checkMinute) {
            var _return = true;

            if (typeof (this.minDate) !== 'undefined' && this.minDate !== null) {
                var _minDate = moment(this.minDate);
                var _date = moment(date);

                if (!checkHour && !checkMinute) {
                    _minDate.hour(0);
                    _minDate.minute(0);

                    _date.hour(0);
                    _date.minute(0);
                }

                _minDate.second(0);
                _date.second(0);
                _minDate.millisecond(0);
                _date.millisecond(0);

                if (!checkMinute) {
                    _date.minute(0);
                    _minDate.minute(0);

                    _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
                }
                else {
                    _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
                }
            }

            return _return;
        },
        isBeforeMaxDate: function (date, checkTime, checkMinute) {
            var _return = true;

            if (typeof (this.maxDate) !== 'undefined' && this.maxDate !== null) {
                var _maxDate = moment(this.maxDate);
                var _date = moment(date);

                if (!checkTime && !checkMinute) {
                    _maxDate.hour(0);
                    _maxDate.minute(0);

                    _date.hour(0);
                    _date.minute(0);
                }

                _maxDate.second(0);
                _date.second(0);
                _maxDate.millisecond(0);
                _date.millisecond(0);

                if (!checkMinute) {
                    _date.minute(0);
                    _maxDate.minute(0);

                    _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
                }
                else {
                    _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
                }
            }

            return _return;
        },
        isInDisableDates: function (date) {
            var dut = date.format('MMMM Do YYYY')
            if (this.disableDates.indexOf(dut) > -1) {
                return false;
            }
            return true;
        },
        isWeekDay: function (date) {
            if (this.weekDays) {
                if (date.isoWeekday() <= 5) {
                    return true;
                }
                return false;
            }
            return true;
        },
        selectDate: function (date) {
            if (date) {
                this.currentDate = moment(date);
                if (!this.isAfterMinDate(this.currentDate)) {
                    this.currentDate = moment(this.minDate);
                }

                if (!this.isBeforeMaxDate(this.currentDate)) {
                    this.currentDate = moment(this.maxDate);
                }
                this.currentDate.locale(this.params.lang);
                this.calendarStart = moment(this.currentDate);
                this.meridien = this.currentDate.hour() >= 12 ? 'PM' : 'AM';
            }
        },
        setName: function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        },
        isPM: function () {
            return this.meridien === 'PM';
        },
        incrementYear: function (amount) {
            if (amount === 1 && this.isNextYearVisible()) {
                this.selectDate(this.currentDate.add(amount, 'year'));
            }

            if (amount === -1 && this.isPreviousYearVisible()) {
                this.selectDate(this.currentDate.add(amount, 'year'));
            }
        },
        isPreviousMonthVisible: function () {
            return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('month'), false, false);
        },
        isNextMonthVisible: function () {
            return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('month'), false, false);
        },
        isPreviousYearVisible: function () {
            return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('year'), false, false);
        },
        isNextYearVisible: function () {
            return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('year'), false, false);
        },
        isHourAvailable: function (hour) {
            var _date = moment(this.currentDate);
            _date.hour(this.convertHours(hour)).minute(0).second(0);
            return this.isAfterMinDate(_date, true, false) && this.isBeforeMaxDate(_date, true, false);
        },
        isMinuteAvailable: function (minute) {
            var _date = moment(this.currentDate);
            _date.minute(minute).second(0);
            return this.isAfterMinDate(_date, true, true) && this.isBeforeMaxDate(_date, true, true);
        },
        start: function () {
            this.currentView = VIEW_STATES.DATE;
            //this.initDates();
            if (this.params.date) {
                this.initDate();
            } else {
                if (this.params.time) {
                    this.initHours();
                }
            }
        },
        today: function () {
            this.selectDate(Date.now());
        },
        ok: function () {
            console.log("ok");
            switch (this.currentView) {
                case VIEW_STATES.DATE:
                    if (this.params.time === true) {
                        this.initHours();
                    }
                    else {
                        this.hide(true);
                    }
                    break;
                case VIEW_STATES.HOUR:
                    this.initMinutes();
                    break;
                case VIEW_STATES.MINUTE:
                    this.hide(true);
                    break;
            }
        },
        cancel: function () {
            if (this.params.time) {
                switch (this.currentView) {
                    case VIEW_STATES.DATE:
                        this.hide();
                        break;
                    case VIEW_STATES.HOUR:
                        if (this.params.date) {
                            this.initDate();
                        }
                        else {
                            this.hide();
                        }
                        break;
                    case VIEW_STATES.MINUTE:
                        this.initHours();
                        break;
                }
            }
            else {
                this.hide();
            }
        },
        selectMonthBefore: function () {
            this.calendarStart.subtract(1, 'months');
        },
        selectMonthAfter: function () {
            this.calendarStart.add(1, 'months');
        },
        selectYearBefore: function () {
            this.calendarStart.subtract(1, 'years');
        },
        selectYearAfter: function () {
            this.calendarStart.add(1, 'years');
        },
        selectAM: function () {
            if (this.isHourAvailable(0) || this.isHourAvailable(12)) {
                if (this.currentDate.hour() >= 12) {
                    this.selectDate(this.currentDate.subtract(12, 'hours'));
                }
                if (!this.isHourAvailable(this.currentDate.hour())) {
                    this.selectDate(this.currentDate.hour(this.minDate.hour()));
                }
                if (!this.isMinuteAvailable(this.currentDate.minute())) {
                    this.selectDate(this.currentDate.minute(this.minDate.minute()));
                }
            }
        },
        selectPM: function () {
            if (this.isHourAvailable(13) || this.isHourAvailable(24)) {
                if (this.currentDate.hour() < 12) {
                    this.selectDate(this.currentDate.add(12, 'hours'));
                }
                if (!this.isHourAvailable(this.currentDate.hour())) {
                    this.selectDate(this.currentDate.hour(this.maxDate.hour()));
                }
                if (!this.isMinuteAvailable(this.currentDate.minute())) {
                    this.selectDate(this.currentDate.minute(this.maxDate.minute()));
                }
            }
        },
        convertHours: function (h) {
            var _return = h;
            if ((h < 12) && this.isPM())
                _return += 12;

            return _return;
        },
        hide: function (okBtn) {
            if (okBtn) {
                this._dialog.hide(this.currentDate);
            } else {
                this._dialog.cancel();
            }
        }
    };


    angular.module(moduleName)
      .directive('mdcDatetimePickerCalendar', [
        function () {

            var YEAR_MIN = 1900,
              YEAR_MAX = 2100,
              MONTHS_IN_ALL = (YEAR_MAX - YEAR_MIN + 1) * 12,
              ITEM_HEIGHT = 240,
              MONTHS = [];
            for (var i = 0; i < MONTHS_IN_ALL; i++) {
                MONTHS.push(i);
            }

            var currentMonthIndex = function (date) {
                var year = date.year();
                var month = date.month();
                return ((year - YEAR_MIN) * 12) + month - 1;
            };

            return {
                restrict: 'E',
                scope: {
                    picker: '=',
                    date: '='
                },
                bindToController: true,
                controllerAs: 'cal',
                controller: ['$scope',
                  function ($scope) {
                      var calendar = this,
                        picker = this.picker,
                        days = [];

                      for (var i = picker.params.weekStart; days.length < 7; i++) {
                          if (i > 6) {
                              i = 0;
                          }
                          days.push(i.toString());
                      }
                      calendar.week = days;
                      if (!picker.maxDate && !picker.minDate) {
                          calendar.months = MONTHS;
                      } else {
                          var low = picker.minDate ? currentMonthIndex(picker.minDate) : 0;
                          var high = picker.maxDate ? (currentMonthIndex(picker.maxDate) + 1) : MONTHS_IN_ALL;
                          calendar.months = MONTHS.slice(low, high);
                      }


                      calendar.getItemAtIndex = function (index) {
                          var month = ((index + 1) % 12) || 12;
                          var year = YEAR_MIN + Math.floor(index / 12);
                          var monthObj = moment(picker.currentDate)
                            .year(year)
                            .month(month);
                          return generateMonthCalendar(monthObj);
                      };

                      calendar.topIndex = currentMonthIndex(picker.currentDate) - calendar.months[0];

                      $scope.$watch(function () {
                          return picker.currentDate ? picker.currentDate.format('YYYY-MM') : '';
                      }, function (val2, val1) {
                          if (val2 != val1) {
                              var nDate = moment(val2, 'YYYY-MM');
                              var index = currentMonthIndex(nDate) - calendar.months[0];
                              if (calendar.topIndex != index) {
                                  calendar.topIndex = index;
                              }
                          }
                      });

                      var generateMonthCalendar = function (date) {
                          var month = {};
                          if (date !== null) {
                              month.name = date.format('MMMM YYYY');
                              var startOfMonth = moment(date).locale(picker.params.lang).startOf('month')
                                .hour(date.hour())
                                .minute(date.minute())
                              ;
                              var iNumDay = startOfMonth.format('d');
                              month.days = [];
                              for (var i = startOfMonth.date() ; i <= startOfMonth.daysInMonth() ; i++) {
                                  if (i === startOfMonth.date()) {
                                      var iWeek = calendar.week.indexOf(iNumDay.toString());
                                      if (iWeek > 0) {
                                          for (var x = 0; x < iWeek; x++) {
                                              month.days.push(0);
                                          }
                                      }
                                  }
                                  month.days.push(moment(startOfMonth).locale(picker.params.lang).date(i));
                              }

                              var daysInAWeek = 7, daysTmp = [], slices = Math.ceil(month.days.length / daysInAWeek);
                              for (var j = 0; j < slices; j++) {
                                  daysTmp.push(month.days.slice(j * daysInAWeek, (j + 1) * daysInAWeek));
                              }
                              month.days = daysTmp;
                              return month;
                          }

                      };

                      calendar.toDay = function (i) {
                          return moment(parseInt(i), "d")
                            .locale(picker.params.lang)
                            .format("dd")
                            .substring(0, 1);
                      };

                      calendar.isInRange = function (date) {
                          return picker.isAfterMinDate(moment(date), false, false)
                            && picker.isBeforeMaxDate(moment(date), false, false)
                            && picker.isWeekDay(moment(date))
                            && picker.isInDisableDates(moment(date));
                      };

                      calendar.selectDate = function (date) {
                          if (date) {
                              if (calendar.isSelectedDay(date)) {
                                  return picker.ok();
                              }
                              picker.selectDate(moment(date).hour(calendar.date.hour()).minute(calendar.date.minute()));
                          }
                      };

                      calendar.isSelectedDay = function (m) {
                          return m && calendar.date.date() === m.date() && calendar.date.month() === m.month() && calendar.date.year() === m.year();
                      };

                      calendar.isDateOfTheDay = function (m) {
                          var today = calendar.picker.options.showTodaysDate;
                          if (!today) {
                              return false;
                          }
                          return m && today.date() === m.date() && today.month() === m.month() && today.year() === m.year();
                      }

                  }
                ],
                template: '<md-virtual-repeat-container md-top-index="cal.topIndex" class="months">' +
                '<div md-virtual-repeat="idx in cal.months" md-start-index="cal.topIndex" md-item-size="' + ITEM_HEIGHT + '">' +
                '     <div mdc-datetime-picker-calendar-month idx="idx"></div>' +
                '</div>' +
                '</md-virtual-repeat-container>'
            };
        }])
      .directive('mdcDatetimePickerCalendarMonth', ['$compile',
        function ($compile) {
            var buildCalendarContent = function (element, scope) {
                var tbody = angular.element(element[0].querySelector('tbody'));
                var calendar = scope.cal, month = scope.month;
                tbody.html('');
                month.days.forEach(function (weekDays, i) {
                    var tr = angular.element('<tr></tr>');
                    weekDays.forEach(function (weekDay, j) {
                        var td = angular.element('<td> </td>');
                        if (weekDay) {
                            var aOrSpan;
                            if (calendar.isInRange(weekDay)) {
                                //build a
                                var scopeRef = 'month["days"][' + i + '][' + j + ']';
                                aOrSpan = angular.element("<a href='#' mdc-dtp-noclick></a>")
                                  .attr('ng-class', '{selected: cal.isSelectedDay(' + scopeRef + ')}')
                                  .attr('ng-click', 'cal.selectDate(' + scopeRef + ')')
                                ;
                            } else {
                                aOrSpan = angular.element('<span></span>')
                            }
                            aOrSpan
                              .addClass('dtp-select-day')
                              .html(weekDay.format('D'));
                            td.append(aOrSpan);
                        }
                        tr.append(td);
                    });
                    tbody.append(tr);
                });
                $compile(tbody)(scope);
            };

            return {
                scope: {
                    idx: '='
                },
                require: '^mdcDatetimePickerCalendar',
                restrict: 'AE',
                template: '<div class="dtp-picker-month">{{month.name}}</div>'
                + '<table class="table dtp-picker-days">'
                + '    <thead>'
                + '    <tr>'
                + '        <th ng-repeat="day in cal.week">{{cal.toDay(day)}}</th>'
                + '    </tr>'
                + '    </thead>'
                + '    <tbody>'
                + '    </tbody>'
                + '</table>',
                link: function (scope, element, attrs, calendar) {
                    scope.cal = calendar;
                    scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
                    buildCalendarContent(element, scope);
                    scope.$watch(function () {
                        return scope.idx;
                    }, function (idx, oldIdx) {
                        if (idx != oldIdx) {
                            scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
                            buildCalendarContent(element, scope);
                        }
                    });
                }
            };
        }
      ])
    ;

    angular.module(moduleName)
      .directive('mdcDtpNoclick', function () {
          return {
              link: function (scope, el) {
                  el.on('click', function (e) {
                      e.preventDefault();
                  });
              }
          };
      });
    angular.module(moduleName)
      .directive('mdcDatetimePickerClock', [
        function () {

            var template = '<div class="dtp-picker-clock"><span ng-if="!points || points.length < 1">&nbsp;</span>'
              + '<div ng-repeat="point in points" class="dtp-picker-time" ng-style="point.style">'
              + '   <a href="#" mdc-dtp-noclick ng-class="{selected: point.value===currentValue}" class="dtp-select-hour" ng-click="setTime(point.value)" ng-if="pointAvailable(point)">{{point.display}}</a>'
              + '   <a href="#" mdc-dtp-noclick class="disabled dtp-select-hour" ng-if="!pointAvailable(point)">{{point.display}}</a>'
              + '</div>'
              + '<div class="dtp-hand dtp-hour-hand"></div>'
              + '<div class="dtp-hand dtp-minute-hand"></div>'
              + '<div class="dtp-clock-center"></div>'
              + '</div>';

            return {
                restrict: 'E',
                template: template,
                link: function (scope, element, attrs) {
                    var minuteMode = attrs.mode === 'minutes';
                    var picker = scope.picker;
                    //banking on the fact that there will only be one at a time
                    var componentRoot = document.querySelector('md-dialog.dtp');
                    var exec = function () {
                        var clock = angular.element(element[0].querySelector('.dtp-picker-clock')),
                          pickerEl = angular.element(componentRoot.querySelector('.dtp-picker'));

                        var w = componentRoot.querySelector('.dtp-content').offsetWidth;
                        var pl = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
                        var pr = parseInt(css(pickerEl, 'paddingRight').replace('px', '')) || 0;
                        var ml = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
                        var mr = parseInt(css(clock, 'marginRight').replace('px', '')) || 0;
                        //set width
                        var clockWidth = (w - (ml + mr + pl + pr));
                        clock.css('width', (clockWidth) + 'px');

                        var pL = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
                        var pT = parseInt(css(pickerEl, 'paddingTop').replace('px', '')) || 0;
                        var mL = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
                        var mT = parseInt(css(clock, 'marginTop').replace('px', '')) || 0;

                        var r = (clockWidth / 2);
                        var j = r / 1.2; //???

                        var points = [];

                        for (var h = 0; h < 12; ++h) {
                            var x = j * Math.sin(Math.PI * 2 * (h / 12));
                            var y = j * Math.cos(Math.PI * 2 * (h / 12));
                            var left = (r + x + pL / 2) - (pL + mL);
                            var top = (r - y - mT / 2) - (pT + mT);

                            var hour = {
                                value: (minuteMode ? (h * 5) : h), //5 for minute 60/12
                                style: { 'margin-left': left + 'px', 'margin-top': top + 'px' }
                            };

                            if (minuteMode) {
                                hour.display = hour.value < 10 ? ('0' + hour.value) : hour.value;
                            } else {

                                if (picker.params.shortTime) {
                                    hour.display = (h === 0) ? 12 : h;
                                } else {
                                    hour.display = picker.isPM() ? h + 12 : h;
                                }
                            }


                            points.push(hour);
                        }

                        scope.points = points;
                        setCurrentValue();
                        clock.css('height', clockWidth + 'px');
                        //picker.initHands(true);

                        var clockCenter = element[0].querySelector('.dtp-clock-center');
                        var centerWidth = (clockCenter.offsetWidth / 2) || 7.5,
                          centerHeight = (clockCenter.offsetHeight / 2) || 7.5;
                        var _hL = r / 1.8;
                        var _mL = r / 1.5;

                        angular.element(element[0].querySelector('.dtp-hour-hand')).css({
                            left: r + (mL * 1.5) + 'px',
                            height: _hL + 'px',
                            marginTop: (r - _hL - pL) + 'px'
                        }).addClass(!minuteMode ? 'on' : '');

                        angular.element(element[0].querySelector('.dtp-minute-hand')).css
                        ({
                            left: r + (mL * 1.5) + 'px',
                            height: _mL + 'px',
                            marginTop: (r - _mL - pL) + 'px'
                        }).addClass(minuteMode ? 'on' : '');

                        angular.element(clockCenter).css({
                            left: (r + pL + mL - centerWidth) + 'px',
                            marginTop: (r - (mL / 2)) - centerHeight + 'px'
                        });
                        animateHands();
                    };

                    var animateHands = function () {
                        var _date = picker.currentNearest5Minute();
                        var h = _date.hour();
                        var m = _date.minute();

                        rotateElement(angular.element(element[0].querySelector('.dtp-hour-hand')), (360 / 12) * h);
                        var mdg = ((360 / 60) * (5 * Math.round(m / 5)));
                        rotateElement(angular.element(element[0].querySelector('.dtp-minute-hand')), mdg);
                    };

                    var rotateElement = function (el, deg) {
                        angular.element(el).css({
                            WebkitTransform: 'rotate(' + deg + 'deg)',
                            '-moz-transform': 'rotate(' + deg + 'deg)',
                            '-ms-transform': 'rotate(' + deg + 'deg)',
                            'transform': 'rotate(' + deg + 'deg)'
                        });
                    };


                    var setCurrentValue = function () {
                        var date = picker.currentNearest5Minute();
                        scope.currentValue = minuteMode ? date.minute() : (date.hour() % 12);
                    };

                    scope.$watch(function () {
                        var tmp = picker.currentNearest5Minute();
                        return tmp ? tmp.format('HH:mm') : '';
                    }, function (newVal) {
                        setCurrentValue();
                        animateHands();
                    });


                    var setDisplayPoints = function (isPM, points) {
                        for (var i = 0; i < points.length; i++) {
                            points[i].display = i;
                            if (isPM) {
                                points[i].display += 12;
                            }
                        }
                        return points;
                    };

                    if (!picker.params.shortTime) {
                        scope.$watch('picker.meridien', function () {
                            if (!minuteMode) {
                                if (scope.points) {
                                    var points = setDisplayPoints(picker.isPM(), angular.copy(scope.points));
                                    scope.points = points;
                                }
                            }
                        });
                    }


                    scope.setTime = function (val) {
                        if (val === scope.currentValue) {
                            picker.ok();
                        }

                        if (!minuteMode) {
                            picker.currentDate.hour(picker.isPM() ? (val + 12) : val);
                        } else {
                            picker.currentDate.minute(val);
                        }
                        picker.currentDate.second(0)
                    };

                    scope.pointAvailable = function (point) {
                        return minuteMode ? picker.isMinuteAvailable(point.value) : picker.isHourAvailable(point.value);
                    };

                    var unWatcher = scope.$watch(function () {
                        return element[0].querySelectorAll('div').length;
                    }, function () {
                        exec();
                        unWatcher();
                    });
                }
            }
        }]);

})(moment);
