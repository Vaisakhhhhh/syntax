// Helper function to extract text contents from HTML, adding space between block elements and filtering raw empty tags
export const getSpacedPlainText = (html: string): string => {
    if (!html) return 'No content';

    // Remove empty paragraph blocks (e.g. <p></p> or <p> </p>) to prevent raw HTML leak
    const cleanHtml = html.replace(/<p>\s*<\/p>/g, '').trim();
    if (!cleanHtml) return 'No content';

    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');

    const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        }

        let text = '';
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            const childText = walk(children[i]);
            if (childText.trim()) {
                const nodeName = children[i].nodeName;
                const isBlock = ['P', 'LI', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL'].includes(nodeName);
                if (isBlock && text) {
                    text += ' ' + childText.trim();
                } else {
                    text += childText;
                }
            }
        }
        return text;
    };

    return walk(doc.body).trim() || 'No content';
};
