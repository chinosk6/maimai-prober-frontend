import { useState } from "react";
import { Title, Card, PasswordInput, TextInput, Text, Group, Button, LoadingOverlay } from '@mantine/core';
import { Container, rem, createStyles } from '@mantine/core';
import { useNavigate } from "react-router-dom";
import {
  IconUser,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import useAlert from '../../utils/useAlert';
import useFormInput from '../../utils/useFormInput';
import reCAPTCHA from '../../utils/reCAPTCHA';
import Alert from "../../components/Alert";
import {API_URL} from "../../main";

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

export default function Register() {
  const { isAlertVisible, alertTitle, alertContent, openAlert, closeAlert } = useAlert();
  const { classes } = useStyles();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const recaptcha = new reCAPTCHA("6LefxhIjAAAAADI0_XvRZmguDUharyWf3kGFhxqX", "register");

  const nameInput = useFormInput('');
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const confirmPasswordInput = useFormInput('');

  const validationRules = {
    name: "用户名不能为空",
    email: "邮箱不能为空",
    password: "密码不能为空",
    confirmPassword: "确认密码不能为空",
  };

  const validateInputs = (inputs: any) => {
    for (const [inputName, errorMessage] of Object.entries(validationRules)) {
      if (!inputs[inputName]) {
        openAlert("注册失败", errorMessage);
        return false;
      }
    }

    if (inputs.password !== inputs.confirmPassword) {
      openAlert("注册失败", "两次输入的密码不一致");
      return false;
    }

    return true;
  };

  const submitRegister = async () => {
    if (!validateInputs({
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    })) {
      return;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      openAlert("注册失败", "两次输入的密码不一致");
      return;
    }
    setVisible(true);
    fetch(`${API_URL}/user/register?recaptcha=${await recaptcha.getToken()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": nameInput.value,
        "email": emailInput.value,
        "password": passwordInput.value,
        "confirmPassword": confirmPasswordInput.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setVisible(false);
        if (data.success) {
          openAlert("注册成功", "请登录你的邮箱，根据指引完成账号激活。");
        } else {
          openAlert("注册失败", data.message);
        }
      })
      .catch((error) => {
        setVisible(false);
        openAlert("注册失败", error);
      });
  }

  return (
    <Container className={classes.root} size={400}>
      <Alert
        title={alertTitle}
        content={alertContent}
        opened={isAlertVisible}
        onClose={closeAlert}
        onConfirm={() => { if (alertTitle === "注册成功") navigate("/login") }}
      />
      <Title order={2} size="h2" weight={900} align="center">
        注册到 maimai DX 查分器
      </Title>
      <Text color="dimmed" size="sm" align="center" mt="sm" mb="xl">
        创建你的 <span className={classes.highlight}>落雪咖啡屋</span> maimai DX 查分器账号
      </Text>
      <Card radius="md" shadow="md" p="xl" withBorder sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
      })}>
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <TextInput
          name="name"
          label="用户名"
          variant="filled"
          placeholder="请输入你的用户名"
          mb={4}
          icon={<IconUser size="1rem" />}
          {...nameInput}
        />
        <Text color="dimmed" size="xs" align="left" mb="sm">
          此用户名将会作为你的 maimai DX 查分器账号的唯一标识，且不会用作查分用途。
        </Text>
        <TextInput
          name="email"
          label="邮箱"
          variant="filled"
          placeholder="请输入你的邮箱"
          mb="sm"
          icon={<IconMail size="1rem" />}
          {...emailInput}
        />
        <PasswordInput
          name="password"
          label="密码"
          variant="filled"
          placeholder="请输入你的密码"
          mb="sm"
          icon={<IconLock size="1rem" />}
          {...passwordInput}
        />
        <PasswordInput
          name="confirm-password"
          label="确认密码"
          variant="filled"
          placeholder="请再次输入你的密码"
          mb="sm"
          icon={<IconLock size="1rem" />}
          {...confirmPasswordInput}
        />
        <Text color="dimmed" size="xs" align="left" mt="sm">
          注册即代表你同意我们的服务条款和隐私政策，请在注册后根据指引绑定你的游戏账号。
        </Text>
        <Group position="right" mt="sm">
          <Button size="sm" variant="default" color="gray" onClick={() => navigate("/login")}>
            登录
          </Button>
          <Button size="sm" onClick={submitRegister}>注册</Button>
        </Group>
      </Card>
    </Container>
  );
}