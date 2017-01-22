/**
 * This is an implementation-in-progress of a WHATWG/HTML proposal #2254
 * Standardize <template> variables and event handlers
 * https://github.com/whatwg/html/issues/2254
 *
 * MIT License
 *
 * Mev-Rael (mevrael@gmail.com)
 *
 * Please provide your feedback, PRs should be submitted here
 * https://github.com/Mevrael/html-template
 *
 * Adds a .parse(data) method to a Template prototype
 *
 * Currently doest not support any statements like if/endif blocks
 */


Object.assign(HTMLTemplateElement.prototype, {

  tokenTypes: {
    UNDEFINED: 0,
    VAR: 1,
    NESTED_VAR: 2,
    IF: 3,
    ENDIF: 4
  },

  parse(data) {
    let html = this.getRootNodeAsHtml();
    const tokens = this.getTokens(html);
    let delta = 0; // when replacing tokens, increase/decrease delta length so next token would be replaced in correct position of html
    tokens.forEach(token => {
      const replaceWith = this.parseToken(token, data);
      html = html.substr(0, token.startsAt - delta) + replaceWith + html.substr(token.endsAt - delta);
      delta += token.length - replaceWith.length;
    });
    return this.htmlToNode(html);
  },

  htmlToNode(html) {
    return document.createRange().createContextualFragment(html).firstChild;
  },

  getRootNode() {
    const nodes = this.content.childNodes;
    const l = nodes.length;
    for (let k = 0; k < l; k++) {
      const node = nodes[k];
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node;
      }
    }
    throw new SyntaxError('Template has no root element node');
  },

  getRootNodeAsHtml() {
    return this.getRootNode().outerHTML;
  },

  // get all the strings within {{ }} in template root node
  getTokens(html) {
    let tokens = [];
    let startAt = 0;
    while(token = this.getNextToken(html, startAt)) {
      tokens.push(token);
      startAt = token.endsAt;
    }
    return tokens;
  },

  // gets next token from an HTML string starting at startAt position
  // if no more tokens found - returns false
  // if token is not closed with }} - throws a SyntaxError
  // if token is found - returns an object:
  // {
  //   value: string - contents of expression between {{ }},
  //   startsAt: position of {{
  //   endsAt: position of }}
  //   length: total length of expression starting from the first "{" and ending with last "}"
  // }
  getNextToken(html, startAt = 0) {
    let startPos = html.indexOf('{{', startAt);
    if (startPos === -1) {
      return false;
    }
    let endPos = html.indexOf('}}', startPos);
    if (endPos === -1) {
      throw new SyntaxError('Template expression is not closed with }}');
    }
    startPos += 2;
    const value = html.substr(startPos, endPos - startPos).trim();
    startPos -= 2;
    endPos += 2;
    return {
      type: this.getTokenTypeByValue(value),
      value: value,
      startsAt: startPos,
      endsAt: endPos,
      length: endPos - startPos
    }
  },

  getTokenTypeByValue(value) {
    if (value.indexOf('if') === 0) {
      return this.tokenTypes.IF;
    } else if (value === 'endif') {
      return this.tokenTypes.ENDIF;
    } else if (value.indexOf('.') !== -1) {
      return this.tokenTypes.NESTED_VAR;
    } else {
      return this.tokenTypes.VAR;
    }
  },

  parseToken(token, data) {
    return this['parseToken' + token.type](token.value, data);
  },

  // VAR
  parseToken1(value, data) {
    if (data[value] === undefined) {
      return '';
    } else {
      return data[value].toString();
    }
  },

  // NESTED_VAR
  parseToken2(value, data) {
    let parts = value.split('.');
    const l = parts.length;
    let curNestData = data;
    for (let k = 0; k < l; k++) {
      if (curNestData[parts[k]] === undefined) {
        return '';
      } else {
        curNestData = curNestData[parts[k]];
      }
    }
    return curNestData;
  },

  // IF
  parseToken3(value, data) {
    return 'if';
  },

  // ENDIF
  parseToken4(value, data) {
    return 'endif';
  },

});
