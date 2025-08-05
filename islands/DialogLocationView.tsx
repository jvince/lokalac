import { Button } from "$components/Button.tsx";
import { Dialog } from "$components/Dialog/Dialog.tsx";
import { DialogActions } from "$components/Dialog/DialogActions.tsx";
import { DialogBody } from "$components/Dialog/DialogBody.tsx";
import { DialogContent } from "$components/Dialog/DialogContent.tsx";
import { DialogTrigger } from "$components/Dialog/DialogTrigger.tsx";
import { LeafletMapSSR } from "$components/LeafletMapSSR.tsx";
import { MarkerSSR } from "$components/MarkerSSR.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { IssueLocation } from "$models/issue.ts";
import type { WithI18nState } from "$plugins/i18n/src/types.ts";
import { Suspense } from "react-dom";
import { IconMap2 } from "../icons.ts";

export interface DialogLocationView extends WithI18nState {
  location: IssueLocation;
}

export function DialogLocationView(props: DialogLocationView) {
  const { t } = useTranslation(props.i18nState);

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
