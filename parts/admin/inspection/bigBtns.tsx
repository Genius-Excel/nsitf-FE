import { Button } from "@/components/ui/button";
import React, { FC } from "react";

interface BigBtnsProps {
  icon: React.ReactNode;
  title: string;
  desription: string;
  color: string;
  onclick?: () => void;
}

const BigBtns: FC<BigBtnsProps> = ({
  desription,
  icon,
  title,
  color,
  onclick,
}) => {
  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-4 md:gap-6 hover:shadow-sm py-10 px-6"
      onClick={onclick}
    >
      <div className={`bg-${color}-100 rounded-sm p-4`}>{icon}</div>
      <div className="space-y-2">
        <h4>{title}</h4>
        <p className="text-muted-foreground">{desription}</p>
      </div>
    </Button>
  );
};

export default BigBtns;
