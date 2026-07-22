import { Button } from "@/components/Button.tsx";
import { Dialog } from "@/components/Dialog/Dialog.tsx";
import { DialogActions } from "@/components/Dialog/DialogActions.tsx";
import { DialogBody } from "@/components/Dialog/DialogBody.tsx";
import { DialogContent } from "@/components/Dialog/DialogContent.tsx";
import { DialogTrigger } from "@/components/Dialog/DialogTrigger.tsx";
import { LeafletMapSSR } from "@/components/LeafletMapSSR.tsx";
import { MarkerSSR } from "@/components/MarkerSSR.ts";
import { useTranslation } from "@/hooks/useClientTranslation.ts";
import { IssueLocation } from "@/models/issue.ts";
import { Suspense } from "preact/compat";
import { IconMap2 } from "../icons.ts";

export interface DialogLocationView {
  location: IssueLocation;
}

export function DialogLocationView(props: DialogLocationView) {
  const { t } = useTranslation();

  return (
    <Dialog size="lg">
      <DialogTrigger>
        <Button
          class="aspect-square p-0"
          color="neutral"
          shape="circle"
          variant="soft"
          title={t("common.view_location")}
        >
          <IconMap2 />
        </Button>
      </DialogTrigger>
      <DialogBody>
        <DialogContent>
          <Suspense fallback={null}>
            <LeafletMapSSR
              center={props.location}
              style={{ height: "100%" }}
              zoom={18}
            >
              <Suspense fallback={null}>
                <MarkerSSR position={props.location} />
              </Suspense>
            </LeafletMapSSR>
          </Suspense>
        </DialogContent>

        <DialogActions>
          <DialogTrigger triggerAction="close">
            <Button autoFocus size="lg">{t("common.close")}</Button>
          </DialogTrigger>
        </DialogActions>
      </DialogBody>
    </Dialog>
  );
}
