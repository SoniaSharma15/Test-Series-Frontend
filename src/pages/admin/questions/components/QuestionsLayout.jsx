export default function QuestionsLayout({ showSplit, FormSection, ListSection }) {
  if (showSplit) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-5">{FormSection}</section>
        <section className="xl:col-span-7">{ListSection}</section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>{FormSection}</section>
      <section>{ListSection}</section>
    </div>
  );
}
