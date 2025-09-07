"use client";

import React, { useEffect, useState } from "react";

/**
 * 클라이언트에서만 렌더링되는 컴포넌트
 * SSR과 CSR 간의 hydration 불일치를 방지합니다.
 */
interface IClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ClientOnly: React.FC<IClientOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
