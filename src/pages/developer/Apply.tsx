import { useEffect, useState } from "react";
import {
  Title,
  Card,
  TextInput,
  Text,
  Group,
  Button,
  LoadingOverlay,
  Textarea
} from '@mantine/core';
import { Container, rem, createStyles } from '@mantine/core';
import useAlert from '../../utils/useAlert';
import ReCaptcha from "../../utils/reCaptcha";
import AlertModal from '../../components/AlertModal';
import { RECAPTCHA_SITE_KEY } from '../../main';
import Icon from "@mdi/react";
import {
  mdiCodeTags,
  mdiLink,
} from "@mdi/js";
import { useForm } from "@mantine/form";
import { getDeveloperApply, sendDeveloperApply } from "../../utils/api/developer";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80),
  },

  highlight: {
    position: 'relative',
    backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
    borderRadius: theme.radius.sm,
    padding: `${rem(4)} ${rem(8)}`,
    color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
  },
}));

export default function DeveloperApply() {
  const { isAlertVisible, alertTitle, alertContent, openAlert, closeAlert } = useAlert();
  const { classes } = useStyles();
  const [applied, setApplied] = useState(false);
  const [visible, setVisible] = useState(false);
  const recaptcha = new ReCaptcha(RECAPTCHA_SITE_KEY, "login");

  useEffect(() => {
    document.title = "申请成为开发者 | maimai DX 查分器";

    getDeveloperApply()
      .then(res => res?.json())
      .then(data => {
        if (data.data != null) {
          if (data.data.api_key != null) {
            window.location.href = "/developer";
          }
          form.setValues(data.data);
          setApplied(true);
        }
      })

    recaptcha.render();

    return () => {
      recaptcha.destroy();
    }
  }, [])

  const form = useForm({
    initialValues: {
      name: '',
      url: '',
      reason: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : "项目名称不能为空"),
      url: (value) => (/^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(value) ? null : "项目地址格式不正确"),
      reason: (value) => (value.length > 0 ? null : "申请理由不能为空"),
    },
  });

  const apply = async (values: any) => {
    setVisible(true);
    sendDeveloperApply(values, await recaptcha.getToken())
      .then((res) => res?.json())
      .then((data) => {
        setVisible(false);
        if (data.success) {
          setApplied(true);
          openAlert("提交成功", "申请成功，我们将尽快审核您的申请");
        } else {
          openAlert("提交失败", data.message);
        }
      })
      .catch((error) => {
        setVisible(false);
        openAlert("提交失败", error);
      });
  }

  return (
    <Container className={classes.root} size={400}>
      <AlertModal
        title={alertTitle}
        content={alertContent}
        opened={isAlertVisible}
        onClose={closeAlert}
      />
      <Title order={2} size="h2" weight={900} align="center">
        申请成为开发者
      </Title>
      <Text color="dimmed" size="sm" align="center" mt="sm" mb="xl">
        提交申请，通过审核后即可获取 API 访问权限
      </Text>
      <Card radius="md" shadow="md" p="xl" withBorder sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
      })}>
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <form onSubmit={form.onSubmit((values) => apply(values))}>
          <TextInput
            name="name"
            label="项目名称"
            variant="filled"
            placeholder="请输入你的项目名称"
            mb="sm"
            icon={<Icon path={mdiCodeTags} size={rem(16)} />}
            disabled={applied}
            {...form.getInputProps('name')}
          />
          <TextInput
            name="url"
            label="项目地址"
            variant="filled"
            placeholder="请输入你的项目地址"
            mb="sm"
            icon={<Icon path={mdiLink} size={rem(16)} />}
            disabled={applied}
            {...form.getInputProps('url')}
          />
          <Textarea
            name="reason"
            label="申请理由"
            variant="filled"
            placeholder="请输入你的申请理由"
            mb="sm"
            disabled={applied}
            {...form.getInputProps('reason')}
          />
          <Group position="apart" mt="xl">
            <div>
              {applied && (
                <Text size="xs" color="dimmed">你的申请正在受理中</Text>
              )}
            </div>
            <Button size="sm" type="submit" disabled={applied}>提交申请</Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}