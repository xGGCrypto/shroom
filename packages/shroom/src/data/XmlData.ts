export class XmlData {
  protected document: Document;
  protected _parseError: boolean = false;

  constructor(xml: string) {
    this.document = new DOMParser().parseFromString(xml, "text/xml");
    // Check for parse errors (browser and jsdom)
    const errorNode = this.document.querySelector("parsererror");
    if (errorNode) {
      this._parseError = true;
      console.error('[XmlData] XML parsing error:', errorNode.textContent || errorNode.innerHTML);
    }
  }

  /** Returns true if the XML document was parsed without errors. */
  public isValid(): boolean {
    return !this._parseError;
  }

  protected querySelectorAll(query: string) {
    return Array.from(this.document.querySelectorAll(query));
  }

  protected querySelector(query: string) {
    return this.document.querySelector(query);
  }
}
