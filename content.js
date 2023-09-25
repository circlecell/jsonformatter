const unixTimestampPattern = /^\d{10}$/;

function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

function isImageUrl(str) {
    const imagePattern = /\.(jpg|jpeg|png|gif|bmp|svg)(\?.*)?$/i;
    return imagePattern.test(str);
}

function wrapImagePreview(str) {
    if (isImageUrl(str)) {
        return `<span class="image-wrapper"><a href="${str}" target="_blank">${str}</a><img src="${str}" alt="Image preview"></span>`;
    }
    return str;
}

function getJsonLintURL(json) {
    const encodedJSON = encodeURIComponent(json);
    return `https://jsonlint.com/?json=${encodedJSON}`;
}

function wrapURL(str) {
    if (isValidURL(str)) {
        return `<a href="${str}" target="_blank">${str}</a>`;
    }
    return str;
}

function wrapColor(str) {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbPattern = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
    const rgbaPattern = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/;

    if (hexPattern.test(str) || rgbPattern.test(str) || rgbaPattern.test(str)) {
        return `<span class="color-preview" style="background-color: ${str}"></span>${str}`;
    }
    return str;
}

function wrapTimestamp(str) {
    if (unixTimestampPattern.test(str)) {
        const date = new Date(Number(str) * 1000); // Convert to milliseconds
        const formattedDate = date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' });
        return `<span class="string">"${str}"</span><span class="timestamp" data-timestamp-comment="${formattedDate}"></span>`;
    }
    return `<span class="string">"${str}"</span>`;
}

function formatJSON(json) {
    let parsedJSON = JSON.parse(json);
    return traverseJSON(parsedJSON);
}

function traverseJSON(obj, isNested = false) {
    if (Array.isArray(obj)) {
        if (obj.length === 0) return isNested ? '' : '<span class="empty">[]</span>';
        let content = obj.map((item, index) => {
            let itemContent = traverseJSON(item);
            let comma = (index !== obj.length - 1) ? ',' : '';
            return `<div>${itemContent}${comma}</div>`;
        }).join('');
        return isNested ? content : `<span class="opening">[</span>${content}<span class="closing">]</span>`;
    } else if (typeof obj === 'object' && obj !== null) {
        let keys = Object.keys(obj);
        if (keys.length === 0) return isNested ? '' : '<span class="empty">{}</span>';
        let content = keys.map((key, index) => {
            let value = obj[key];
            let valueContent = traverseJSON(value, true);
            let comma = (index !== keys.length - 1) ? ',' : '';

            if (Array.isArray(value)) {
                return `<div><span class="arrow-down collapsible"><svg height="15" width="15" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg></span><span class="k">"${key}"</span>: <span class="opening">[</span><span class="ellipsis"></span></span><div class="content array-wrapper">${valueContent}</div><span class="closing">]</span>${comma}<span class="item-count" count="${value.length} ${value.length === 1 ? 'item' : 'items'}"></span></div>`;
            } else if (typeof value === 'object' && value !== null) {
                return `<div><span class="arrow-down collapsible"><svg height="15" width="15" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg></span><span class="k">"${key}"</span>: <span class="opening">{</span><div class="content object-wrapper">${valueContent}</div><span class="closing">}</span>${comma}<span class="item-count" count="${Object.keys(value).length} ${Object.keys(value).length === 1 ? 'item' : 'items'}"></span></div>`;
            } else {
                return `<div class="kvp"><span class="kvr"><span class="placeholder-arrow"></span><span class="k">"${key}"</span><span class="c">:</span> <span class="v">${valueContent}${comma}</span></span></div>`;
            }
        }).join('');

        if (isNested) {
            return `${content}`;
        } else {
            return `<span class="arrow-down collapsible"><svg height="15" width="15" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg><span class="opening">{</span><span class="ellipsis"></span></span><div class="content">${content}</div><span class="closing">}</span><span class="item-count" count="${keys.length} ${keys.length === 1 ? 'item' : 'items'}"></span>`;
        }
    } else {
		if (typeof obj === 'string') {
		    if (unixTimestampPattern.test(obj)) {
		        return wrapTimestamp(obj);
		    } else {
				let wrappedStr = wrapURL(wrapColor(wrapImagePreview(obj)));
		        return `<span class="string">"${wrappedStr}"</span>`;
		    }
		}
        if (typeof obj === 'number') return `<span class="number">${obj}</span>`;
		if (typeof obj === 'boolean') return `<span class="boolean ${obj ? 'true' : 'false'}">${obj}</span>`;
        if (obj === null) return `<span class="null">null</span>`;
    }
}


if (isJSON(document.body.innerText)) {
    const rawJSON = document.body.innerText;
	document.body.setAttribute('data-isjson', 'yes');
    // Dynamically inject the font-face rules
    const fontStyles = `
    @font-face {
        font-family: 'MonoLisa';
        src: url('${chrome.runtime.getURL("fonts/MonoLisaVariableNormal.woff2")}') format('woff2');
        font-weight: normal;
        font-style: normal;
    }

    @font-face {
        font-family: 'MonoLisa';
        src: url('${chrome.runtime.getURL("fonts/MonoLisaVariableItalic.woff2")}') format('woff2');
        font-weight: normal;
        font-style: italic;
    }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = fontStyles;
    document.head.appendChild(styleSheet);
	
	const jsonLintIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    jsonLintIcon.setAttribute("viewBox", "0 0 48 48");
    jsonLintIcon.setAttribute("width", "20");
    jsonLintIcon.setAttribute("height", "20");
    jsonLintIcon.setAttribute("class", "jsonLintIcon");
    jsonLintIcon.innerHTML = '<path d="M0 0h48v48H0z" fill="none"/><path d="M38 8H10c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h8v-4h-8V16h28v20h-8v4h8c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM24 20l-8 8h6v12h4V28h6l-8-8z"/>';
    jsonLintIcon.addEventListener('click', function() {
        const encodedJSON = encodeURIComponent(rawJSON);
        const jsonLintURL = `https://jsonlint.com/?json=${encodedJSON}`;
        window.open(jsonLintURL, '_blank');
    });
	
	const toggleButton = document.createElement('button');
    toggleButton.addEventListener('click', function() {
        if (document.body.getAttribute('data-view') === 'formatted') {
            document.body.innerText = rawJSON;
            document.body.prepend(toggleButton);
			document.body.prepend(jsonLintIcon);
            document.body.setAttribute('data-view', 'raw');
        } else {
            document.body.innerHTML = formatJSON(rawJSON);
            document.body.prepend(toggleButton);
			document.body.prepend(jsonLintIcon);
            addCollapsibleListeners();
            document.body.setAttribute('data-view', 'formatted');
        }
    });

    function addCollapsibleListeners() {
        document.querySelectorAll('.collapsible').forEach(collapsible => {
            collapsible.addEventListener('click', function() {
                let content = this.nextElementSibling;
                while (content && !content.classList.contains('content')) {
                    content = content.nextElementSibling;
                }
                if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    // Toggle the arrow icon
                    if (content.style.display === 'none') {
                        this.classList.replace('arrow-down', 'arrow-right');
                    } else {
                        this.classList.replace('arrow-right', 'arrow-down');
                    }
                }
            });
        });
    }

    document.body.innerHTML = formatJSON(rawJSON);
    document.body.prepend(toggleButton); // Ensure the toggle button is added after setting innerHTML
    document.body.prepend(jsonLintIcon); // Add the JSONLint icon button next to the toggle button
    addCollapsibleListeners(); // Ensure the event listeners are attached after setting innerHTML
    document.body.setAttribute('data-view', 'formatted');
	
}