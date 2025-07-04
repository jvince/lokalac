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
import { i18nState } from "$plugins/i18n/mod.ts";
import EyeIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/eye.tsx";
import { Suspense } from "react-dom";

export interface LocationDialogProps {
  i18nState: i18nState;
  location: IssueLocation;
}

export function LocationDialog(props: LocationDialogProps) {
  const { t } = useTranslation(props.i18nState);

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          aria-label={t("common.view_location")}
          class="aspect-square p-0"
          color="neutral"
        >
          <EyeIcon />
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
