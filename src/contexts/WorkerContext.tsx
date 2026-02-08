import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WorkerPermissions {
  can_sell: boolean;
  can_view_reports: boolean;
  can_view_cost: boolean;
  can_edit_products: boolean;
  can_edit_inventory: boolean;
  can_manage_workers: boolean;
}

export interface Worker {
  id: string;
  name: string;
  is_admin: boolean;
  permissions: WorkerPermissions;
}

interface WorkerContextType {
  worker: Worker | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasPermission: (permission: keyof WorkerPermissions) => boolean;
  login: (workerData: Worker) => void;
  logout: () => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
};

interface WorkerProviderProps {
  children: ReactNode;
}

export const WorkerProvider = ({ children }: WorkerProviderProps) => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود بيانات العامل في localStorage
    const savedWorker = localStorage.getItem("currentWorker");
    if (savedWorker) {
      try {
        setWorker(JSON.parse(savedWorker));
      } catch {
        localStorage.removeItem("currentWorker");
      }
    }
    setLoading(false);
  }, []);

  const login = (workerData: Worker) => {
    setWorker(workerData);
    localStorage.setItem("currentWorker", JSON.stringify(workerData));
  };

  const logout = () => {
    setWorker(null);
    localStorage.removeItem("currentWorker");
  };

  const hasPermission = (permission: keyof WorkerPermissions): boolean => {
    if (!worker) return false;
    if (worker.is_admin) return true;
    return worker.permissions[permission] || false;
  };

  const value: WorkerContextType = {
    worker,
    loading,
    isLoggedIn: !!worker,
    isAdmin: worker?.is_admin || false,
    hasPermission,
    login,
    logout,
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
};
