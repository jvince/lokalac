import { Button } from "@/components/Button.tsx";
import { Dialog } from "@/components/Dialog/Dialog.tsx";
import { DialogActions } from "@/components/Dialog/DialogActions.tsx";
import { DialogBody } from "@/components/Dialog/DialogBody.tsx";
import { DialogContent } from "@/components/Dialog/DialogContent.tsx";
import { DialogTrigger } from "@/components/Dialog/DialogTrigger.tsx";
import { useTranslation } from "@/hooks/useClientTranslation.ts";
import { IconNotes } from "@/icons.ts";
import { withGlobalContext } from "@/islands/withGlobalContext.tsx";

interface DialogNoteViewProps {
  note?: string;
}

export const DialogNoteView = withGlobalContext(function DialogNoteView(
  props: DialogNoteViewProps,
) {
  const { note } = props;
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          class="aspect-square p-0"
          color="neutral"
          shape="circle"
          variant="soft"
          title={t("common.view_note")}
        >
          <IconNotes />
        </Button>
      </DialogTrigger>
      <DialogBody>
        <DialogContent>
          <p>{note}</p>
        </DialogContent>
        <DialogActions>
          <DialogTrigger triggerAction="close">
            <Button autoFocus size="lg">{t("common.close")}</Button>
          </DialogTrigger>
        </DialogActions>
      </DialogBody>
    </Dialog>
  );
});
