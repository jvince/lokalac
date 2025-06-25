import { Button } from "$components/Button.tsx";
import { CommunityVectorLayerSSR } from "$components/CommunityVectorLayerSSR.tsx";
import { Dialog } from "$components/Dialog/Dialog.tsx";
import { DialogActions } from "$components/Dialog/DialogActions.tsx";
import { DialogBody } from "$components/Dialog/DialogBody.tsx";
import { DialogContent } from "$components/Dialog/DialogContent.tsx";
import { DialogTrigger } from "$components/Dialog/DialogTrigger.tsx";
import { Form } from "$components/Form.tsx";
import { Input } from "$components/Input.tsx";
import { LeafletMapSSR } from "$components/LeafletMapSSR.tsx";
import { MarkerSSR } from "$components/MarkerSSR.ts";
import { Select } from "$components/Select.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useAbortableFetch } from "$hooks/useAbortableFetch.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import type { IssueCategory } from "$models/issue-category.ts";
import type { IssueType } from "$models/issue-type.ts";
import type { LocalCommunity } from "$models/local-community.ts";
import { i18nState } from "$plugins/i18n/mod.ts";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useDeepSignal } from "deepsignal";
import MapPinOffIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/map-pin-off.tsx";
import MapPinPlusIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/map-pin-plus.tsx";
import type { LatLngLiteral, LatLngTuple } from "leaflet";
import type { ComponentChildren, JSX } from "preact";
import { useCallback } from "preact/hooks";
import { Suspense } from "react-dom";

interface IssueFormProps {
  i18nState: i18nState;
  categories: IssueCategory[];
  children?: ComponentChildren;
  communities: LocalCommunity[];
  issueTypes: IssueType[];
}

interface IssueFormState {
  issueCategory: string | null;
  issueType: string | null;
  localCommunity: string | null;
  location?: LatLngLiteral | null;
  get locationFormatted(): string;
  get canSubmit(): boolean;
}

export function IssueForm(props: IssueFormProps) {
  const { t, fromObject } = useTranslation(props.i18nState);
  const isDialogOpen = useSignal(false);

  const formState = useDeepSignal<IssueFormState>({
    issueCategory: null,
    issueType: null,
    localCommunity: null,
    location: null,
    get locationFormatted() {
      if (!this.location) {
        return t("common.no_location_selected");
      }

      return `${this.location.lat}, ${this.location.lng}`;
    },
    get canSubmit() {
      return !!(this.issueCategory && this.issueType && this.localCommunity);
    },
  });

  const shouldFetch = IS_BROWSER && !!formState.localCommunity;

  const onChangeHandler = useCallback(
    (field: keyof IssueFormState) =>
    (e: JSX.TargetedEvent<HTMLSelectElement>) => {
      const value = e.currentTarget.value;

      if (field in formState) {
        (formState as any)[field] = value;
      }
    },
    [],
  );

  const [data] = useAbortableFetch<LatLngTuple[]>(
    `/api/polygon/${formState.localCommunity}`,
    {
      enabled: shouldFetch,
      defaultValue: [],
    },
  );

  useSignalEffect(() => {
    if (formState.$localCommunity?.value) {
      formState.location = null;
    }
  });

  return (
    <>
      {JSON.stringify(formState.$canSubmit)}
      <Form
        method="POST"
        action="/submit-issue"
        lang={props.i18nState.language.code}
        f-client-nav={false}
      >
        <fieldset class="fieldset gap-y-4">
          <legend class="fieldset-legend">
            Create an Issue
          </legend>

          <Select
            fullWidth
            name="local_community"
            required
            size="lg"
            onChange={onChangeHandler("localCommunity")}
          >
            <option disabled selected value="">
              {t("common.local_community")}
            </option>
            {props.communities.map((community) => (
              <option value={community.id} key={community.id}>
                {fromObject(community, "name")}
              </option>
            ))}
          </Select>

          <Select
            fullWidth
            name="issue_category"
            required
            size="lg"
            onChange={onChangeHandler("issueCategory")}
          >
            <option disabled selected value="">
              Select a category
            </option>
            {props.categories.map((category) => (
              <option value={category.id} key={category.id}>
                {fromObject(category, "name")}
              </option>
            ))}
          </Select>

          <Select
            fullWidth
            name="issue_type"
            required
            size="lg"
            onChange={onChangeHandler("issueType")}
          >
            <option disabled selected value="">
              Select a issue
            </option>
            {props.issueTypes
              .filter((issueType) =>
                issueType.category === formState.issueCategory
              )
              .map((issue) => (
                <option value={issue.id} key={issue.id}>
                  {fromObject(issue, "name")}
                </option>
              ))}
          </Select>

          <Input
            contentAfter={
              <Button
                disabled={!formState.location}
                color="warning"
                size="lg"
                onClick={() => {
                  formState.location = null;
                }}
              >
                <MapPinOffIcon />
              </Button>
            }
            contentBefore={
              <Button
                color="secondary"
                disabled={!formState.localCommunity}
                size="lg"
                onClick={() => {
                  isDialogOpen.value = true;
                }}
              >
                <MapPinPlusIcon />
              </Button>
            }
            fullWidth
            readOnly
            size="lg"
            value={formState.$locationFormatted}
          />

          <input
            type="hidden"
            name="location"
            value={JSON.stringify(formState.location)}
          />

          <Dialog
            open={isDialogOpen}
            onOpenChange={(e) => isDialogOpen.value = e.detail.open}
          >
            <DialogBody>
              <DialogContent>
                <Suspense fallback="Loading map...">
                  {IS_BROWSER && (
                    <LeafletMapSSR style={{ height: "100%" }}>
                      <Suspense fallback={null}>
                        <CommunityVectorLayerSSR
                          positions={data as LatLngTuple[]}
                          onClick={(_, data) => {
                            formState.location = data;
                          }}
                        />
                        {formState.location && (
                          <MarkerSSR position={formState.location}>
                            <span>Selected Location</span>
                          </MarkerSSR>
                        )}
                      </Suspense>
                    </LeafletMapSSR>
                  )}
                </Suspense>
              </DialogContent>

              <DialogActions>
                <DialogTrigger triggerAction="close">
                  <Button autoFocus size="lg">Close</Button>
                </DialogTrigger>
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => {
                    // Do something on Ok
                    isDialogOpen.value = false;
                  }}
                >
                  Ok
                </Button>
              </DialogActions>
            </DialogBody>
          </Dialog>

          <textarea class="textarea" placeholder="note" name="note" />

          <Button
            color="primary"
            // disabled={!formState.canSubmit}
            size="lg"
            type="submit"
          >
            {t("common.submit")}
          </Button>
        </fieldset>
      </Form>
    </>
  );
}
