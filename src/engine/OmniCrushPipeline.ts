/**
 * OmniCrushPipeline
 * Master Coordinator orchestrating HTML, CSS, JS, ImportMap, and Parametric Engine.
 */
import { CssCrusher } from './CssCrusher';
import { HtmlAstCrusher } from './HtmlAstCrusher';
import { ImportMapCrusher } from './ImportMapCrusher';
import { JsAstCrusher } from './JsAstCrusher';
import { MetricsEngine } from './MetricsEngine';
import { OmniCrushRehydrator } from './OmniCrushRehydrator';
import { ParametricEngine } from './ParametricEngine';
import { OmniCrushedDocument } from './types';

export class OmniCrushPipeline {
  private static instance: OmniCrushPipeline;

  private htmlCrusher: HtmlAstCrusher;
  private cssCrusher: CssCrusher;
  private importMapCrusher: ImportMapCrusher;
  private jsCrusher: JsAstCrusher;
  private parametricEngine: ParametricEngine;
  private rehydrator: OmniCrushRehydrator;
  private metricsEngine: MetricsEngine;

  constructor() {
    this.htmlCrusher = HtmlAstCrusher.getInstance();
    this.cssCrusher = CssCrusher.getInstance();
    this.importMapCrusher = ImportMapCrusher.getInstance();
    this.jsCrusher = JsAstCrusher.getInstance();
    this.parametricEngine = ParametricEngine.getInstance();
    this.rehydrator = OmniCrushRehydrator.getInstance();
    this.metricsEngine = MetricsEngine.getInstance();
  }

  public static getInstance(): OmniCrushPipeline {
    if (!OmniCrushPipeline.instance) {
      OmniCrushPipeline.instance = new OmniCrushPipeline();
    }
    return OmniCrushPipeline.instance;
  }

  /**
   * Complete pipeline: Ingest raw HTML and produce losslessly crushed OmniCrushedDocument
   */
  public process(rawHtml: string): OmniCrushedDocument {
    // 1. Parse HTML and separate inline styles, scripts, import maps
    const rawParsed = this.htmlCrusher.crush(rawHtml);

    // 2. Crush CSS
    const combinedCss = rawParsed.inlineStyles.join('\n');
    const crushedCss = this.cssCrusher.crush(combinedCss);

    // 3. Crush Import Maps
    const crushedImportMaps = rawParsed.importMaps.map((im) => this.importMapCrusher.crush(im));

    // 4. Crush Scripts
    const crushedScripts = rawParsed.inlineScripts.map((s) =>
      this.jsCrusher.crush(s.content, s.id, s.type, s.src)
    );

    // 5. Discover Parametric Variables
    const parametrics = this.parametricEngine.discoverVariables({
      domTree: rawParsed.domTree,
      css: crushedCss,
      dictionaries: rawParsed.dictionaries,
      metadata: rawParsed.metadata,
    });

    // 6. Compute Minified HTML for baseline comparison
    const tempDoc: OmniCrushedDocument = {
      version: '1.0.0',
      timestamp: Date.now(),
      metadata: rawParsed.metadata,
      dictionaries: rawParsed.dictionaries,
      domTree: rawParsed.domTree,
      css: crushedCss,
      importMaps: crushedImportMaps,
      scripts: crushedScripts,
      parametrics,
      stats: {} as any,
    };

    const minifiedHtml = this.rehydrator.rehydrate(tempDoc, { minified: true });

    // 7. Calculate benchmark metrics
    const stats = this.metricsEngine.calculate(rawHtml, minifiedHtml, tempDoc);
    tempDoc.stats = stats;

    return tempDoc;
  }
}
