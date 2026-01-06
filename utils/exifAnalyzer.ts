/**
 * EXIF Analyzer Utility
 * Analyzes EXIF metadata to determine if an image is likely camera-captured or AI-generated
 */

export interface ExifAnalysisResult {
  score: number; // 0-100, higher = more likely real camera photo
  isLikelyReal: boolean;
  isStronglyReal: boolean; // If true, can skip AI model (very confident it's real)
  confidence: number; // 0-100
  indicators: {
    hasCameraModel: boolean;
    hasGPS: boolean;
    hasDateTime: boolean;
    hasSoftware: boolean;
    hasOrientation: boolean;
    suspiciousSoftware: boolean;
    hasCameraSettings: boolean;
  };
  reasoning: string[];
}

// Common AI generation software indicators
const AI_SOFTWARE_PATTERNS = [
  /midjourney/i,
  /dall-e/i,
  /dall\.e/i,
  /stable diffusion/i,
  /stablediffusion/i,
  /leonardo/i,
  /adobe firefly/i,
  /photoshop.*generative/i,
];

/**
 * Analyze EXIF data to determine authenticity likelihood
 */
export function analyzeExif(exif: Record<string, any> | null | undefined): ExifAnalysisResult {
  const reasoning: string[] = [];
  let score = 0;
  
  const indicators = {
    hasCameraModel: false,
    hasGPS: false,
    hasDateTime: false,
    hasSoftware: false,
    hasOrientation: false,
    suspiciousSoftware: false,
    hasCameraSettings: false,
  };

  // No EXIF data at all
  if (!exif || Object.keys(exif).length === 0) {
    reasoning.push('❌ Tidak ada data EXIF sama sekali (sangat mencurigakan)');
    return {
      score: 0,
      isLikelyReal: false,
      isStronglyReal: false,
      confidence: 80,
      indicators,
      reasoning,
    };
  }

  // Check for camera model/make
  if (exif.Make || exif.Model || exif.LensMake || exif.LensModel) {
    indicators.hasCameraModel = true;
    score += 35;
    reasoning.push(`✅ Memiliki info kamera: ${exif.Make || ''} ${exif.Model || ''}`.trim());
  } else {
    reasoning.push('⚠️ Tidak ada informasi model kamera');
  }

  // Check for GPS data
  if (exif.GPSLatitude || exif.GPSLongitude || exif.GPSAltitude) {
    indicators.hasGPS = true;
    score += 25;
    reasoning.push('✅ Memiliki data GPS lokasi');
  }

  // Check for datetime original (when photo was taken)
  if (exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized) {
    indicators.hasDateTime = true;
    score += 15;
    reasoning.push('✅ Memiliki timestamp pengambilan gambar');
  }

  // Check for orientation (common in real photos)
  if (exif.Orientation) {
    indicators.hasOrientation = true;
    score += 5;
  }

  // Check software field (can be indicator of AI)
  if (exif.Software || exif.ProcessingSoftware) {
    indicators.hasSoftware = true;
    const software = `${exif.Software || ''} ${exif.ProcessingSoftware || ''}`.toLowerCase();
    
    // Check if it matches AI generation patterns
    const matchesAI = AI_SOFTWARE_PATTERNS.some(pattern => pattern.test(software));
    
    if (matchesAI) {
      indicators.suspiciousSoftware = true;
      score -= 40; // Heavy penalty
      reasoning.push(`🚫 Software mencurigakan terdeteksi: ${exif.Software || exif.ProcessingSoftware}`);
    } else if (software.includes('photo') || software.includes('camera')) {
      score += 10;
      reasoning.push('✅ Software kamera/foto terdeteksi');
    }
  }

  // Check for camera settings (ISO, Aperture, Shutter Speed, etc.)
  const hasCameraSettings = exif.ISOSpeedRatings || exif.FNumber || exif.ExposureTime || 
                            exif.FocalLength || exif.WhiteBalance || exif.Flash;
  if (hasCameraSettings) {
    indicators.hasCameraSettings = true;
    score += 20;
    reasoning.push('✅ Memiliki pengaturan kamera (ISO, aperture, dll)');
  } else {
    reasoning.push('⚠️ Tidak ada pengaturan kamera');
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine confidence based on available indicators
  const totalIndicators = Object.values(indicators).filter(v => v === true).length;
  const confidence = Math.min(95, 50 + (totalIndicators * 10));

  // Strong Real Detection: If has camera model + camera settings + datetime (minimum requirement)
  // OR has camera model + GPS (very strong indicator)
  const isStronglyReal = !indicators.suspiciousSoftware && (
    (indicators.hasCameraModel && indicators.hasCameraSettings && indicators.hasDateTime) ||
    (indicators.hasCameraModel && indicators.hasGPS)
  );

  return {
    score,
    isLikelyReal: score >= 60,
    isStronglyReal,
    confidence,
    indicators,
    reasoning,
  };
}

/**
 * Combine EXIF analysis with AI model results for final verdict
 */
export interface CombinedDetectionResult {
  isAI: boolean;
  isUncertain: boolean;
  confidence: number;
  exifScore: number;
  modelScore: number;
  finalScore: number;
  reasoning: string[];
}

export function combineDetectionResults(
  exifAnalysis: ExifAnalysisResult,
  modelResult: { isAI: boolean; confidence: number } | null,
  options: {
    exifWeight?: number; // 0-1, default 0.3
    modelWeight?: number; // 0-1, default 0.7
    uncertaintyThreshold?: number; // default 60
  } = {}
): CombinedDetectionResult {
  const exifWeight = options.exifWeight ?? 0.3;
  const modelWeight = options.modelWeight ?? 0.7;
  const uncertaintyThreshold = options.uncertaintyThreshold ?? 60;

  const reasoning: string[] = [...exifAnalysis.reasoning];

  // EXIF score (0-100, higher = more real)
  const exifScore = exifAnalysis.score;

  // Model score (0-100, higher = more AI)
  let modelScore = 50; // Default uncertain
  if (modelResult) {
    modelScore = modelResult.isAI ? modelResult.confidence : (100 - modelResult.confidence);
    reasoning.push(
      `🤖 Model AI: ${modelResult.isAI ? 'AI Generated' : 'Real'} (${modelResult.confidence.toFixed(1)}%)`
    );
  } else {
    reasoning.push('⚠️ Model AI tidak dijalankan');
  }

  // Final score: weighted combination
  // Convert to same scale: higher = more AI
  const exifAIScore = 100 - exifScore; // Invert: EXIF gives "real" score, we need "AI" score
  const finalScore = (exifAIScore * exifWeight) + (modelScore * modelWeight);

  const isAI = finalScore > 50;
  
  // Advanced confidence calculation with agreement factor
  const baseConfidence = Math.abs(finalScore - 50) * 2; // Distance from 50, scaled to 0-100
  
  // Agreement factor: both systems agree or disagree?
  const exifSaysAI = exifAIScore > 50;
  const modelSaysAI = modelScore > 50;
  const agreement = exifSaysAI === modelSaysAI;
  
  // Calculate strength difference between EXIF and Model
  const exifStrength = Math.abs(exifAIScore - 50);
  const modelStrength = Math.abs(modelScore - 50);
  const strengthGap = Math.abs(exifStrength - modelStrength);
  
  // Adjust confidence based on agreement and strength gap
  let confidence = baseConfidence;
  if (agreement) {
    // Both agree: boost confidence slightly based on how strong both are
    const avgStrength = (exifStrength + modelStrength) / 2;
    const boost = Math.min(avgStrength * 0.1, 10); // Max +10%
    confidence = Math.min(confidence + boost, 98);
  } else {
    // Disagree: reduce confidence based on strength gap
    const penalty = Math.min(strengthGap * 0.15, 15); // Max -15%
    confidence = Math.max(confidence - penalty, 30);
  }
  
  // Add slight variance based on metadata richness to avoid fixed numbers
  const metadataRichness = Object.values(exifAnalysis.indicators).filter(v => v === true).length;
  const variance = (metadataRichness % 3) * 2; // 0, 2, or 4% variance
  confidence = Math.min(confidence + variance, 98);
  
  const isUncertain = confidence < uncertaintyThreshold;

  reasoning.push(
    `📊 Final Score: ${finalScore.toFixed(1)} (${isAI ? 'AI' : 'Real'}, confidence: ${confidence.toFixed(1)}%)`
  );

  return {
    isAI,
    isUncertain,
    confidence,
    exifScore,
    modelScore,
    finalScore,
    reasoning,
  };
}
