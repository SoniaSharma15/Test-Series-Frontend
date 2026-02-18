export default function QuestionModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Add Question
          </h2>
          <button onClick={onClose}>✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}
