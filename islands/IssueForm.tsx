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
import { computed, useSignal, useSignalEffect } from "@preact/signals";
import PinIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/pin-filled.tsx";
import type { LatLng, LatLngTuple } from "leaflet";
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
  localCommunity: string | null;
  issueCategory: string | null;
  issueType: string | null;
}

export function IssueForm(props: IssueFormProps) {
  const { t, fromObject } = useTranslation(props.i18nState);

  const isDialogOpen = useSignal(false);

  const location = useSignal<LatLng | null>(null);
  const formState = useSignal<IssueFormState>({
    localCommunity: null,
    issueCategory: null,
    issueType: null,
  });

  const shouldFetch = IS_BROWSER && !!formState.value.localCommunity;

  const canSubmit = computed(() => (
    Object.values(formState.value).every(Boolean)
  ));

  const onChangeHandler = useCallback(
    (field: keyof IssueFormState) =>
    (e: JSX.TargetedEvent<HTMLSelectElement>) => {
      const value = e.currentTarget.value;
      formState.value = {
        ...formState.value,
        [field]: value === "" ? null : value,
      };
    },
    [],
  );

  const [data] = useAbortableFetch<LatLngTuple[]>(
    `/api/polygon/${formState.value.localCommunity}`,
    {
      enabled: shouldFetch,
      defaultValue: [],
    },
  );

  useSignalEffect(() => {
    if (formState.value.localCommunity) {
      location.value = null;
    }
  });

  return (
    <>
      <Form method="POST" action="/submit-issue" f-client-nav={false}>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            Create an Issue
          </legend>

          <Select
            name="local_community"
            required
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
            name="issue_category"
            required
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
            name="issue_type"
            required
            disabled={!formState.value.issueCategory}
            onChange={onChangeHandler("issueType")}
          >
            <option disabled selected value="">
              Select a issue
            </option>
            {props.issueTypes
              .filter((issueType) =>
                issueType.category === formState.value.issueCategory
              )
              .map((issue) => (
                <option value={issue.id} key={issue.id}>
                  {fromObject(issue, "name")}
                </option>
              ))}
          </Select>

          <Input placeholder="Lokacija" />

          <Dialog
            open={isDialogOpen}
            onOpenChange={(e) => isDialogOpen.value = e.detail.open}
          >
            <DialogTrigger>
              <Button iconOnly shape="circle">
                <PinIcon />
              </Button>
            </DialogTrigger>

            <DialogBody>
              <DialogContent>
                <Suspense fallback="Loading map...">
                  {IS_BROWSER && (
                    <LeafletMapSSR style={{ height: "100%" }}>
                      <Suspense fallback={null}>
                        <CommunityVectorLayerSSR
                          positions={data as LatLngTuple[]}
                          onClick={(_, data) => {
                            location.value = data;
                          }}
                        />
                        {location.value && (
                          <MarkerSSR position={location.value}>
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

          <Button disabled={!canSubmit.value} type="submit">
            {t("common.submit")}
          </Button>
        </fieldset>
      </Form>
    </>
  );
}
