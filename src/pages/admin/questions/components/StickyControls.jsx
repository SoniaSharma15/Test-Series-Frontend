import LanguageControls from "../components/LanguageControls";
import ModeSwitch from "../components/ModeSwitch";

export default function StickyControls({
  langMode, setLangMode, dualLang, setDualLang, isHindiOnly,
  mode, setMode, onToNormal, onToPassage,
}) {
  return (
    <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4 bg-[#F8FAFC]/90 backdrop-blur border-y border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm p-4">
            <LanguageControls
              langMode={langMode}
              setLangMode={setLangMode}
              dualLang={dualLang}
              setDualLang={setDualLang}
              isHindiOnly={isHindiOnly}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm p-4">
            <ModeSwitch mode={mode} setMode={setMode} onToNormal={onToNormal} onToPassage={onToPassage} />
          </div>
        </div>
      </div>
    </div>
  );
}
