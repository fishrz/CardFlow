import React from 'react';
import { Download, Upload } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const DataSettings: React.FC = () => {
  const { cards, transactions, importData, layoutMode } = useStore();
  const isDesktop = layoutMode === 'desktop';

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ cards, transactions }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "credit_flow_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            if (e.target?.result) {
                try {
                    const parsedData = JSON.parse(e.target.result as string);
                    if (parsedData.cards && parsedData.transactions) {
                        importData(parsedData);
                        alert("Data imported successfully!");
                    } else {
                        alert("Invalid file format.");
                    }
                } catch (error) {
                    alert("Error reading file.");
                }
            }
        };
    }
  };

  return (
    <div className={`mt-12 pt-6 pb-24 border-t border-gray-200 ${isDesktop ? 'px-6 lg:px-8' : 'px-6'}`}>
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">Data Management</h3>
      <div className={`flex gap-4 ${isDesktop ? 'max-w-md' : ''}`}>
        <button 
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm text-text-primary font-medium active:scale-95 transition-transform hover:shadow-md"
        >
            <Download size={18} />
            Export
        </button>
        <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm text-text-primary font-medium cursor-pointer active:scale-95 transition-transform hover:shadow-md">
            <Upload size={18} />
            Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>
      <p className="text-xs text-text-muted mt-4 text-center">
        Your data is stored locally on this device. Export to backup.
      </p>
    </div>
  );
};
