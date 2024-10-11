import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

export default function Accounts() {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col grow-1 justify-center">
          <h1 className="text-3xl font-bold text-foreground-secondary">
            Accounts
          </h1>
          <span className="text-sm text-muted-foreground">
            Add or manage your linked bank accounts
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Icon.download.minimalistic.outline />
          </Button>

          <Button>
            <Icon.add.circle.outline />
            <span className="ms-1">Link bank account</span>
          </Button>
        </div>
      </div>
    </>
  );
}
