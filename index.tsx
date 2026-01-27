import React, { useState, useRef, ChangeEvent } from "react";
import { createRoot } from "react-dom/client";
import { toPng } from 'html-to-image';
import { jsPDF } from "jspdf";
import './index.css';

// --- Configuration & Constants ---

const STATIC_INFO = {
  companyCN: "深圳墨影科技有限公司",
  companyEN: "Shenzhen Moying Robotics Co., Ltd.",
  addressLabelCN: "地址",
  addressLabelEN: "Address",
  addressCN: "深圳市宝安区航城街道深圳宝星墨影科技园",
  addressEN: "Shenzhen Baoxing Moying Technology Park, Hangcheng street, Bao'an District, Shenzhen",
  mobileLabelCN: "手机",
  mobileLabelEN: "Mobile",
  emailLabelCN: "邮箱",
  emailLabelEN: "E-Mail",
  telLabelCN: "电话",
  telLabelEN: "Tel",
  tel: "+86 0755 27909950",
  webLabelCN: "网址",
  webLabelEN: "Web",
  web: "www.moyingrobotics.com",
};

const initialData = {
  nameCN: "吴玥琰",
  nameEN: "Joseph Wu",
  titleCN: "销售总监",
  titleEN: "Sales Director",
  mobile: "187 1011 2703",
  email: "chongwei.wu@moying.ai",
};

// --- Components ---

const ContactRow = ({
  labelCN, labelEN, value,
  labelWidthClass = "w-[16mm]",
  subValue = null,
  fontSize = 5
}: {
  labelCN: string, labelEN: string, value: string,
  labelWidthClass?: string, subValue?: string | null,
  fontSize?: number
}) => (
  <div className="flex items-baseline">
    {/* Label Container - Fixed Width for perfect alignment */}
    <div className={`${labelWidthClass} flex items-baseline shrink-0 select-none`}>
      {/* Chinese Label */}
      <span className="text-[#111] font-normal leading-none" style={{ fontSize: `${fontSize}pt` }}>{labelCN}</span>

      {/* Inner Separator - Text Pipe */}
      <span className="mx-[1mm] text-[#C0392B] font-light leading-none relative top-[-0.3px] opacity-90" style={{ fontSize: `${fontSize}pt` }}>|</span>

      {/* English Label: Reduced by 1pt relative to base */}
      <span className="text-[#555] font-normal leading-none" style={{ fontSize: `${Math.max(fontSize - 1, 3)}pt` }}>{labelEN}</span>
    </div>

    {/* Outer Separator - Text Pipe */}
    <span className="mr-[2mm] ml-[1mm] text-[#C0392B] font-light leading-none relative top-[-0.3px] opacity-90 select-none" style={{ fontSize: `${fontSize}pt` }}>|</span>

    {/* Value Block */}
    <div className="flex flex-col justify-center">
      {/* Value */}
      <span className="text-[#000] leading-none font-normal tracking-wide" style={{ fontSize: `${fontSize}pt` }}>{value}</span>
      {/* SubValue */}
      {subValue && <span className="text-gray-500 leading-tight mt-[0.3mm] tracking-normal" style={{ fontSize: `${Math.max(fontSize - 1, 3)}pt` }}>{subValue}</span>}
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState(initialData);
  const [frontLogoImg, setFrontLogoImg] = useState<string | null>(null);
  const [backBgImg, setBackBgImg] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Font Size Settings (in points)
  const [fontSizes, setFontSizes] = useState({
    nameCN: 17,
    nameEN: 9,
    titleCN: 11,
    titleEN: 8,
    contactBase: 5,
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Refs for capturing
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Create PDF with standard business card size (90mm x 54mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [90, 54]
      });

      // Helper to capture element
      const capture = async (element: HTMLElement) => {
        // html-to-image uses native browser rendering (SVG foreignObject)
        // This supports all modern CSS features including oklch
        return await toPng(element, {
          quality: 1.0,
          pixelRatio: 4, // High resolution
          backgroundColor: "#ffffff",
          width: element.scrollWidth,
          height: element.scrollHeight,
          style: {
            fontFamily: "'Roboto', 'Noto Sans SC', sans-serif"
          }
        });
      };

      // Capture Front
      const frontData = await capture(frontCardRef.current);
      pdf.addImage(frontData, "PNG", 0, 0, 90, 54);

      // Add Back Page
      pdf.addPage([90, 54], "landscape");

      // Capture Back
      const backData = await capture(backCardRef.current);
      pdf.addImage(backData, "PNG", 0, 0, 90, 54);

      // Save
      pdf.save(`BusinessCard-${data.nameEN.replace(/\s+/g, "_")}.pdf`);

    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("PDF 生成失败，请查看控制台了解详情 / PDF Generation failed. Please check console for details.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">

      {/* --- Editor Sidebar --- */}
      <div className="w-full md:w-[360px] bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen no-print z-20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#C0392B] rounded-sm"></span>
            名片信息编辑
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Custom Images Section */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">图片替换 / Custom Images</h3>

            {/* Front Logo Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">正面 Logo (Top Right)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => frontInputRef.current?.click()}
                  className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition shadow-sm"
                >
                  {frontLogoImg ? "更换图片 / Change" : "上传图片 / Upload"}
                </button>
                {frontLogoImg && (
                  <button onClick={() => setFrontLogoImg(null)} className="text-xs text-red-500 hover:text-red-700 px-2">清除 / Clear</button>
                )}
              </div>
              <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setFrontLogoImg)} />
            </div>

            {/* Back Background Upload */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">背面完整设计图 (Full Back Image)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => backInputRef.current?.click()}
                  className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition shadow-sm"
                >
                  {backBgImg ? "更换图片 / Change" : "上传背面设计图 / Upload"}
                </button>
                {backBgImg && (
                  <button onClick={() => setBackBgImg(null)} className="text-xs text-red-500 hover:text-red-700 px-2">清除 / Clear</button>
                )}
              </div>
              <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setBackBgImg)} />
              <p className="text-[10px] text-gray-400 mt-1">请上传包含Logo和二维码的完整背面图</p>
            </div>
          </div>


          {/* Name Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">个人信息 / Personal</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">中文姓名 (Name CN)</label>
                <input
                  name="nameCN" value={data.nameCN} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-lg font-medium bg-transparent outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">英文姓名 (Name EN)</label>
                <input
                  name="nameEN" value={data.nameEN} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-base bg-transparent outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">职位 / Title</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">中文职位 (Title CN)</label>
                <input
                  name="titleCN" value={data.titleCN} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-base bg-transparent outline-none transition-colors text-[#C0392B]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">英文职位 (Title EN)</label>
                <input
                  name="titleEN" value={data.titleEN} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-sm bg-transparent outline-none transition-colors text-[#C0392B]"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-normal text-gray-400 uppercase tracking-wider">联系方式 / Contact</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-normal text-gray-500 mb-1">手机号码 (Mobile)</label>
                <input
                  name="mobile" value={data.mobile} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-base bg-transparent outline-none transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-normal text-gray-500 mb-1">电子邮箱 (E-Mail)</label>
                <input
                  name="email" value={data.email} onChange={handleChange}
                  className="w-full border-b border-gray-300 focus:border-[#C0392B] px-0 py-1 text-base bg-transparent outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Font Adjustment Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              字体大小调整 / Font Size
              <button
                onClick={() => setFontSizes({ nameCN: 17, nameEN: 9, titleCN: 11, titleEN: 8, contactBase: 5 })}
                className="text-[10px] text-blue-500 font-normal hover:underline cursor-pointer"
              >
                重置 / Reset
              </button>
            </h3>

            <div className="space-y-3 bg-gray-50 p-3 rounded text-xs">
              {/* Helper to render slider */}
              {[
                { label: "中文姓名 (Name CN)", key: "nameCN", min: 12, max: 24 },
                { label: "英文姓名 (Name EN)", key: "nameEN", min: 6, max: 16 },
                { label: "中文职位 (Title CN)", key: "titleCN", min: 8, max: 16 },
                { label: "英文职位 (Title EN)", key: "titleEN", min: 5, max: 12 },
                { label: "联系方式 (Contact)", key: "contactBase", min: 3, max: 8 },
              ].map((item) => (
                <div key={item.key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-gray-500">
                    <span>{item.label}</span>
                    <span className="font-mono text-gray-700">{fontSizes[item.key as keyof typeof fontSizes]}pt</span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={0.5}
                    value={fontSizes[item.key as keyof typeof fontSizes]}
                    onChange={(e) => setFontSizes({ ...fontSizes, [item.key]: parseFloat(e.target.value) })}
                    className="w-full accent-[#C0392B] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-[#C0392B] hover:bg-[#a93226] text-white py-3 rounded shadow-lg font-medium tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中... / Generating...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                下载 PDF / Download PDF
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded shadow-sm font-medium tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            打印 / Print
          </button>
        </div>
      </div>

      {/* --- Preview Area --- */}
      <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-start print-area bg-[#e5e7eb]">
        <div className="mb-4 no-print text-gray-500 text-sm font-medium">
          Standard 90mm x 54mm Preview (Blank Template Mode)
        </div>

        {/* --- FRONT SIDE --- */}
        <div ref={frontCardRef} className="business-card bg-white relative shadow-2xl print:shadow-none mb-10 overflow-hidden text-[#1a1a1a]">

          {/* Top Right: Logo Block OR Custom Image */}
          <div className="absolute top-[5mm] right-[5mm] z-10">
            {frontLogoImg ? (
              // Custom Image - Reduced size
              <img src={frontLogoImg} className="h-[9mm] w-auto max-w-[28mm] object-contain" alt="Front Logo" />
            ) : (
              // BLANK TEMPLATE - No Default Logo
              null
            )}
          </div>

          {/* Top Left: Name & Title Grid - UNIFIED GRID FOR ALIGNMENT */}
          {/* Increased gap-y to 1.5mm to add spacing between CN and EN rows */}
          {/* Moved UP from 16mm to 12mm as requested */}
          <div className="absolute top-[12mm] left-[6mm] z-10 grid grid-cols-[auto_auto_auto] gap-x-[1.5mm] gap-y-[1.5mm]">
            {/* Row 1: CN Name, Separator, Title */}
            <div className="font-bold leading-none tracking-wide text-black self-end" style={{ fontSize: `${fontSizes.nameCN}pt` }}>
              {data.nameCN}
            </div>
            <div className="self-end mb-[1px]">
              <div className="h-[5mm] w-[1px] bg-gray-300"></div>
            </div>
            <div className="text-[#C0392B] font-medium leading-none self-end mb-[1px]" style={{ fontSize: `${fontSizes.titleCN}pt` }}>
              {data.titleCN}
            </div>

            {/* Row 2: EN Name, Separator, Title */}
            <div className="font-normal leading-none text-black self-start" style={{ fontSize: `${fontSizes.nameEN}pt` }}>
              {data.nameEN}
            </div>
            <div className="self-start">
              <div className="h-[3mm] w-[1px] bg-gray-200"></div>
            </div>
            <div className="text-[#C0392B] font-normal leading-none self-start" style={{ fontSize: `${fontSizes.titleEN}pt` }}>
              {data.titleEN}
            </div>
          </div>

          {/* Middle Left: Company Name - Restored & Positioned */}
          <div className="absolute bottom-[20mm] left-[6mm] z-10">
            <div className="text-[8pt] font-bold text-[#333] tracking-wide leading-none mb-[1mm]">
              {STATIC_INFO.companyCN}
            </div>
            <div className="text-[5pt] text-[#555] font-normal leading-none tracking-normal">
              {STATIC_INFO.companyEN}
            </div>
          </div>

          {/* Bottom: Contact Grid - STRICT ALIGNMENT */}
          <div className="absolute bottom-[5mm] left-[6mm] right-[5mm] z-10">

            {/* Row 1: Address (Full Width) */}
            <div className="mb-[1.5mm]">
              <ContactRow
                labelCN={STATIC_INFO.addressLabelCN}
                labelEN={STATIC_INFO.addressLabelEN}
                labelWidthClass="w-[12mm]" // Standard Width
                value={STATIC_INFO.addressCN}
                subValue={STATIC_INFO.addressEN}
                fontSize={fontSizes.contactBase + 0.25}
              />
            </div>

            {/* Grid for Bottom 2 Rows: Left Col (Mobile/Email) | Right Col (Tel/Web) */}
            <div className="grid grid-cols-[1.3fr_0.9fr] gap-x-[2mm]">

              {/* Left Column */}
              <div className="flex flex-col gap-[1.5mm]">
                <ContactRow
                  labelCN={STATIC_INFO.mobileLabelCN}
                  labelEN={STATIC_INFO.mobileLabelEN}
                  labelWidthClass="w-[12mm]" // Standard Width
                  value={data.mobile}
                  fontSize={fontSizes.contactBase}
                />
                <ContactRow
                  labelCN={STATIC_INFO.emailLabelCN}
                  labelEN={STATIC_INFO.emailLabelEN}
                  labelWidthClass="w-[12mm]" // Standard Width
                  value={data.email}
                  fontSize={fontSizes.contactBase}
                />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-[1.5mm]">
                <ContactRow
                  labelCN={STATIC_INFO.telLabelCN}
                  labelEN={STATIC_INFO.telLabelEN}
                  labelWidthClass="w-[10mm]" // Narrower width for Right Column
                  value={STATIC_INFO.tel.replace("+86 ", "+86 ")}
                  fontSize={fontSizes.contactBase}
                />
                <ContactRow
                  labelCN={STATIC_INFO.webLabelCN}
                  labelEN={STATIC_INFO.webLabelEN}
                  labelWidthClass="w-[10mm]" // Narrower width for Right Column
                  value={STATIC_INFO.web}
                  fontSize={fontSizes.contactBase}
                />
              </div>
            </div>
          </div>
        </div>


        {/* --- BACK SIDE --- */}
        <div ref={backCardRef} className="business-card bg-white relative shadow-2xl print:shadow-none print:break-before-page overflow-hidden flex items-center justify-center">

          {backBgImg ? (
            // Custom Background Image - Covers everything
            <img src={backBgImg} className="absolute inset-0 w-full h-full object-cover z-0" alt="Back Background" />
          ) : (
            // BLANK TEMPLATE - Placeholder Text
            <div className="absolute inset-0 z-0 bg-white flex items-center justify-center border-2 border-dashed border-gray-100">
              <span className="text-gray-300 text-xs font-medium">Back Design Area (Upload Image)</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// --- Mount the App ---
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}