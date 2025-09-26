"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ITransactionView } from "@/types/budget";

/**
 * 거래 내역 컴포넌트의 props 인터페이스
 */
interface ITransactionCardProps {
  /** 거래 내역 */
  transaction: ITransactionView;
}

/**
 * 거래 내역을 표시하는 컴포넌트
 *
 * @param props - 거래 내역 컴포넌트 props
 * @returns 거래 내역 컴포넌트
 */
const TransactionCard: React.FC<ITransactionCardProps> = ({ transaction }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{transaction.description}</p>
        <p className="text-sm text-gray-500">
          {formatDate(transaction?.date as Date)} • {transaction.category} •{" "}
          {transaction.card}
        </p>
      </div>
      <span
        className={`font-semibold ${
          transaction.type === "입금" ? "text-green-600" : "text-red-600"
        }`}
      >
        {transaction.type === "입금" ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
};

export default TransactionCard;
